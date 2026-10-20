import React, { useState, useEffect, useRef } from 'react';
import { ShuffleControl } from './ShuffleControl';
import { ReadingGuidance } from './ReadingGuidance';
import { ReadingSlots } from './ReadingSlots';
import { TarotCardView } from './TarotCardView';
import { CardDetailLightbox } from './CardDetailLightbox';
import { StardustCanvas, StardustEmitterHandle } from './StardustCanvas';
import { ReadingPhase, TarotCard, PositionedCard } from '../types/tarot';
import { ritualAudio } from '../engine/sound';
import { calculateOrbitPose, calculateFanPose } from '../engine/kinematics';
import { getSlotCoordinate } from '../constants/layout';

interface DeckExperienceProps {
  phase: ReadingPhase;
  initialDeckOrder: TarotCard[];
  selectedCards: PositionedCard[];
  onStartShuffle: () => void;
  onSelectCard: (cardId: string) => void;
  onFlipCard: (cardId: string) => void;
  onResetReading?: () => void;
}

interface CardPhysicsBody {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

const ROTATION_SLERP_SPEED = 0.075;
const SWIPE_DISTANCE_THRESHOLD = 45; // Single swipe distance in px to spin the ring and trigger shuffle
const VISIBLE_ORBIT_CARDS = 50; // 50 visible cards orbiting in the celestial 3D ring
const TILT_RAD = -21 * (Math.PI / 180); // 21-degree diagonal banking angle
const IDLE_ORBIT_VELOCITY = -0.0016; // Calm, meditative counter-clockwise orbital drift

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const DeckExperience: React.FC<DeckExperienceProps> = ({
  phase,
  initialDeckOrder,
  selectedCards,
  onStartShuffle,
  onSelectCard,
  onFlipCard,
  onResetReading,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tappedOrbitCardId, setTappedOrbitCardId] = useState<string | null>(null);
  const [lightboxCardId, setLightboxCardId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const bodiesRef = useRef<Map<string, CardPhysicsBody>>(new Map());
  const emitterRef = useRef<StardustEmitterHandle | null>(null);

  // Orbit & Swirl Controller Refs
  const orbitAngleRef = useRef(0);
  const orbitVelocityRef = useRef(IDLE_ORBIT_VELOCITY);
  const swirlAccumulatorRef = useRef(0);
  const hasTriggeredShuffleRef = useRef(false);
  const shuffleStartTimeRef = useRef<number | null>(null);
  const fanTransitionStartTimeRef = useRef<number | null>(null);
  const spinDirectionRef = useRef<number>(-1);

  // Pointer / Drag Interaction Refs
  const heldCardIdRef = useRef<string | null>(null);
  const suppressedHoverCardIdRef = useRef<string | null>(null);
  const suppressAllHoverUntilMoveRef = useRef(false);
  const dropPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);
  const isPointerInsideRef = useRef(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPointerAngleRef = useRef<number | null>(null);
  const dragDistanceRef = useRef(0);

  // Keep latest props in refs for the 60fps physics loop
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const selectedCardsRef = useRef(selectedCards);
  selectedCardsRef.current = selectedCards;
  const deckOrderRef = useRef(initialDeckOrder);
  deckOrderRef.current = initialDeckOrder;
  const fanDeckOrderRef = useRef<TarotCard[]>(initialDeckOrder);
  const viewportWidthRef = useRef(viewportWidth);
  viewportWidthRef.current = viewportWidth;
  const hoveredIdRef = useRef(hoveredId);
  hoveredIdRef.current = hoveredId;
  const tappedOrbitCardIdRef = useRef(tappedOrbitCardId);
  tappedOrbitCardIdRef.current = tappedOrbitCardId;
  const lightboxCardIdRef = useRef(lightboxCardId);
  lightboxCardIdRef.current = lightboxCardId;

  useEffect(() => {
    fanDeckOrderRef.current = [...initialDeckOrder];
  }, [initialDeckOrder]);

  useEffect(() => {
    if (phase === 'intro') {
      swirlAccumulatorRef.current = 0;
      hasTriggeredShuffleRef.current = false;
      shuffleStartTimeRef.current = null;
      fanTransitionStartTimeRef.current = null;
      heldCardIdRef.current = null;
      suppressedHoverCardIdRef.current = null;
      suppressAllHoverUntilMoveRef.current = false;
      hoveredIdRef.current = null;
      setHoveredId(null);
      setTappedOrbitCardId(null);
      setLightboxCardId(null);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--swirl-progress', '0%');
        containerRef.current.style.setProperty('--swirl-opacity', '0');
      }
    } else if (phase === 'shuffling') {
      shuffleStartTimeRef.current = performance.now();
      fanTransitionStartTimeRef.current = null;
      orbitVelocityRef.current = spinDirectionRef.current * 0.14;
      heldCardIdRef.current = null;
      suppressedHoverCardIdRef.current = null;
      suppressAllHoverUntilMoveRef.current = false;
      hoveredIdRef.current = null;
      setHoveredId(null);
      setTappedOrbitCardId(null);
      setLightboxCardId(null);
      ritualAudio.playShuffleChime();
    } else {
      setTappedOrbitCardId(null);
      if (phase === 'fan') {
        fanTransitionStartTimeRef.current = performance.now();
        suppressAllHoverUntilMoveRef.current = true;
        setLightboxCardId(null);
      }
    }
  }, [phase]);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    let resizeFrameId: number;
    const handleResize = () => {
      cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(() => {
        setViewportWidth(window.innerWidth);
      });
    };
    window.addEventListener('resize', handleResize);

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(resizeFrameId);
      mediaQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  // Main 60fps Antigravity + Tilted 3D Carousel Physics Loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animId: number;
    const startTime = performance.now();

    const step = (now: number) => {
      const timeSec = (now - startTime) * 0.001;
      const currentPhase = phaseRef.current;
      const currentSelected = selectedCardsRef.current;
      const deck = deckOrderRef.current;
      const vw = viewportWidthRef.current;

      const selectedIds = new Set(currentSelected.map((c) => c.card.id));

      // Update orbital carousel velocity & angle
      if (currentPhase === 'intro') {
        orbitAngleRef.current += orbitVelocityRef.current;
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, IDLE_ORBIT_VELOCITY, 0.02);
      } else if (currentPhase === 'shuffling') {
        let targetSpin = spinDirectionRef.current * 0.12;
        if (shuffleStartTimeRef.current !== null) {
          const elapsed = now - shuffleStartTimeRef.current;
          const p = Math.min(1, Math.max(0, elapsed / 3000));
          // Steady, majestic orbital spin during the weave, softly decelerating as it blooms into the spread
          if (p < 0.65) {
            targetSpin = spinDirectionRef.current * 0.13;
          } else {
            const decelT = (p - 0.65) / 0.35;
            targetSpin = spinDirectionRef.current * Math.max(0.02, 0.13 - decelT * 0.11);
          }
        }
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, targetSpin, 0.04);
        orbitAngleRef.current += orbitVelocityRef.current;
      } else {
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, -0.0012, 0.025);
        orbitAngleRef.current += orbitVelocityRef.current;
      }

      // Sync orbital angle with StardustCanvas astrolabe tracks & comets
      emitterRef.current?.setOrbitState(
        orbitAngleRef.current,
        orbitVelocityRef.current,
        currentPhase
      );

      const isMobile = vw < 768;
      const rx = isMobile ? 165 : 340;
      const ry = isMobile ? 88 : 172;
      const rz = isMobile ? 120 : 210;

      // Celestial Orbital Ring Dynamics (50 Cards):
      // Zero-collapse: the ring stays expansive, breathing gently outward (1.0 -> 1.05 -> 1.08).
      // Multi-harmonic celestial waves give it living movement without collapsing or breaking apart.
      let mergeFactor = 1;
      let shuffleWobbleAmp = 0;

      if (currentPhase === 'shuffling' && shuffleStartTimeRef.current !== null) {
        const elapsed = now - shuffleStartTimeRef.current;
        const p = Math.min(1, Math.max(0, elapsed / 3000));

        // Smooth expansive breathing: NEVER contracts below 1.0
        if (p < 0.3) {
          const t = p / 0.3;
          const easeIn = 0.5 - 0.5 * Math.cos(t * Math.PI);
          mergeFactor = 1.0 + easeIn * 0.05; // 1.0 -> 1.05
        } else if (p < 0.75) {
          mergeFactor = 1.05;
        } else {
          const t = (p - 0.75) / 0.25;
          const easeBloom = 0.5 - 0.5 * Math.cos(t * Math.PI);
          mergeFactor = 1.05 + easeBloom * 0.03; // 1.05 -> 1.08
        }

        // Living celestial undulating movement without collapse
        if (p >= 0.08 && p <= 0.92) {
          const u = (p - 0.08) / 0.84;
          shuffleWobbleAmp = Math.sin(u * Math.PI) * 0.045;
        }
      }

      deck.forEach((card, index) => {
        const el = cardNodeRefs.current.get(card.id);
        if (!el) return;

        let body = bodiesRef.current.get(card.id);
        if (!body) {
          body = {
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            scale: 1,
          };
          bodiesRef.current.set(card.id, body);
        }

        const selectedIndex = currentSelected.findIndex((c) => c.card.id === card.id);
        const isSelected = selectedIndex !== -1;
        const isBeingHeld =
          heldCardIdRef.current === card.id &&
          currentPhase !== 'intro' &&
          currentPhase !== 'shuffling';

        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let targetRotZ = 0;
        let targetScale = 1;
        let opacity = 1;
        let blurPx = 0;
        let brightness = 1;

        let fanStackIndex = index;
        let orbitZIndex = index;
        let tuckX = 0;
        let tuckY = 0;
        let tuckRotY = 0;
        let tuckRotZ = 0;

        const isInspecting = !!lightboxCardIdRef.current;
        const inspectedId = lightboxCardIdRef.current;
        const isFocusedCard = isInspecting && card.id === inspectedId;
        const isHovered = hoveredIdRef.current === card.id;

        if (isSelected) {
          if (isInspecting) {
            // Inspect Focus Mode: Selected card lifts forward; other two cards fan out behind
            if (isFocusedCard) {
              targetX = 0;
              // Subtly enlarge card when hovered while lifting upward to protect content clearance below
              const baseScale = isMobile ? 1.35 : 1.52;
              targetScale = isHovered ? baseScale + 0.045 : baseScale;
              const baseY = isMobile ? -78 : -100;
              targetY = isHovered ? baseY - 3 : baseY;
              targetZ = isHovered ? 178 : 165;
              targetRotX = 0;
              targetRotY = 0;
              targetRotZ = 0;
              blurPx = 0;
              brightness = isHovered ? 1.18 : 1.15;
            } else {
              // Two companion cards fanned out behind
              const focusedSlotIndex = currentSelected.findIndex((c) => c.card.id === inspectedId);

              if (focusedSlotIndex === 0) {
                // Focused card is PAST (slot 0)
                if (selectedIndex === 1) {
                  // PRESENT fans out slightly to the right
                  targetX = isMobile ? 52 : 68;
                  targetY = isMobile ? -88 : -112;
                  targetZ = 75;
                  targetRotZ = 7.5;
                  targetRotY = -5;
                  targetRotX = 2;
                  targetScale = isMobile ? 1.05 : 1.16;
                  brightness = 0.78;
                  blurPx = 0.3;
                } else {
                  // FUTURE fans out further to the right
                  targetX = isMobile ? 98 : 130;
                  targetY = isMobile ? -98 : -124;
                  targetZ = 45;
                  targetRotZ = 14;
                  targetRotY = -9;
                  targetRotX = 4;
                  targetScale = isMobile ? 0.98 : 1.08;
                  brightness = 0.68;
                  blurPx = 0.5;
                }
              } else if (focusedSlotIndex === 1) {
                // Focused card is PRESENT (slot 1)
                if (selectedIndex === 0) {
                  // PAST fans out to the left
                  targetX = isMobile ? -56 : -74;
                  targetY = isMobile ? -90 : -114;
                  targetZ = 65;
                  targetRotZ = -8.5;
                  targetRotY = 6;
                  targetRotX = 2;
                  targetScale = isMobile ? 1.05 : 1.16;
                  brightness = 0.76;
                  blurPx = 0.3;
                } else {
                  // FUTURE fans out to the right
                  targetX = isMobile ? 56 : 74;
                  targetY = isMobile ? -90 : -114;
                  targetZ = 65;
                  targetRotZ = 8.5;
                  targetRotY = -6;
                  targetRotX = 2;
                  targetScale = isMobile ? 1.05 : 1.16;
                  brightness = 0.76;
                  blurPx = 0.3;
                }
              } else {
                // Focused card is FUTURE (slot 2)
                if (selectedIndex === 1) {
                  // PRESENT fans out slightly to the left
                  targetX = isMobile ? -52 : -68;
                  targetY = isMobile ? -88 : -112;
                  targetZ = 75;
                  targetRotZ = -7.5;
                  targetRotY = 5;
                  targetRotX = 2;
                  targetScale = isMobile ? 1.05 : 1.16;
                  brightness = 0.78;
                  blurPx = 0.3;
                } else {
                  // PAST fans out further to the left
                  targetX = isMobile ? -98 : -130;
                  targetY = isMobile ? -98 : -124;
                  targetZ = 45;
                  targetRotZ = -14;
                  targetRotY = 9;
                  targetRotX = 4;
                  targetScale = isMobile ? 0.98 : 1.08;
                  brightness = 0.68;
                  blurPx = 0.5;
                }
              }

              if (isHovered) {
                brightness = 0.96;
                blurPx = 0;
                targetScale += 0.04;
              }
            }
          } else {
            // Standard 3-card spread positions
            const coord = getSlotCoordinate(selectedIndex, isMobile);
            targetX = coord.x;
            targetY = coord.y;
            targetZ = 60;
            targetRotX = 0;
            targetRotY = 0;
            targetRotZ = 0;
          }
        } else if (currentPhase === 'intro' || currentPhase === 'shuffling') {
          const orbitPose = calculateOrbitPose(index, orbitAngleRef.current, timeSec, {
            rx,
            ry,
            rz,
            tiltRad: TILT_RAD,
            mergeFactor,
            shuffleWobbleAmp,
            isMobile,
            visibleOrbitCards: VISIBLE_ORBIT_CARDS,
          });

          targetX = orbitPose.x;
          targetY = orbitPose.y;
          targetZ = orbitPose.z;
          targetRotX = orbitPose.rotX;
          targetRotY = orbitPose.rotY;
          targetRotZ = orbitPose.rotZ;
          targetScale = orbitPose.scale;
          opacity = orbitPose.opacity;
          orbitZIndex = orbitPose.zIndex;
          brightness = orbitPose.brightness;
          blurPx = orbitPose.blurPx;
          tuckX = orbitPose.tuckX ?? 0;
          tuckY = orbitPose.tuckY ?? 0;
          tuckRotY = orbitPose.tuckRotY ?? 0;
          tuckRotZ = orbitPose.tuckRotZ ?? 0;

          // If this card is tapped (or hovered) in the ring, make it rise gracefully from the ring
          if (
            currentPhase === 'intro' &&
            (tappedOrbitCardIdRef.current === card.id || hoveredIdRef.current === card.id)
          ) {
            const isTapped = tappedOrbitCardIdRef.current === card.id;
            if (isTapped) {
              targetY -= isMobile ? 65 : 85;
              targetZ = 80;
              targetRotX = 0;
              targetRotY = 0;
              targetRotZ = 0;
              targetScale = isMobile ? 1.18 : 1.28;
              blurPx = 0;
              brightness = 1.15;
            } else {
              targetY -= 16;
              targetScale += 0.04;
              blurPx = 0;
              brightness = 1.12;
            }
          }
        } else {
          // 'fan' or 'place' or 'read' for unselected cards
          if (currentSelected.length >= 3) {
            targetX = 0;
            targetY = 80;
            targetZ = -120;
            targetScale = 0.75;
            opacity = 0;
          } else {
            const unselectedCards = fanDeckOrderRef.current.filter((c) => !selectedIds.has(c.id));
            const fanIndex = unselectedCards.findIndex((c) => c.id === card.id);
            fanStackIndex = fanIndex !== -1 ? fanIndex : index;
            const totalUnselected = Math.max(1, unselectedCards.length);

            const spreadWidth = Math.min(vw - 32, 820);
            const cardWidth = isMobile ? 96 : 128;
            const maxOffset = spreadWidth / 2 - cardWidth / 2;

            const fanPose = calculateFanPose({
              fanStackIndex,
              totalUnselected,
              maxOffset,
              cardWidth,
              isMobile,
              timeSec,
            });

            targetX = fanPose.x;
            targetY = fanPose.y;
            targetZ = fanPose.z;
            targetRotX = fanPose.rotX;
            targetRotY = fanPose.rotY;
            targetRotZ = fanPose.rotZ;
            targetScale = fanPose.scale;

            // Smooth opacity fade for extra unselected cards during the slow fan transition
            if (currentPhase === 'fan' && fanTransitionStartTimeRef.current !== null) {
              const fanElapsed = now - fanTransitionStartTimeRef.current;
              if (index >= VISIBLE_ORBIT_CARDS) {
                opacity = Math.min(1, Math.max(0, (fanElapsed - 300) / 1400));
              } else {
                opacity = 1;
              }
            } else {
              opacity = 1;
            }

            if (heldCardIdRef.current) {
              const activeFanIndex = unselectedCards.findIndex(
                (c) => c.id === heldCardIdRef.current
              );
              const dist = fanStackIndex - activeFanIndex;
              const radius = 7;
              const stepPush = 9;
              if (Math.abs(dist) > 0 && Math.abs(dist) < radius) {
                const push = (radius - Math.abs(dist)) * stepPush;
                targetX += dist > 0 ? push : -push;
              }
            } else if (
              isPointerInsideRef.current &&
              !suppressAllHoverUntilMoveRef.current &&
              totalUnselected > 1 &&
              (fanTransitionStartTimeRef.current === null ||
                now - fanTransitionStartTimeRef.current >= 2200)
            ) {
              // Smoothly separate fanned cards around the cursor with a pronounced, dramatic split
              const px = prevPointerPosRef.current.x;
              const py = prevPointerPosRef.current.y;

              // Smooth horizontal & vertical envelope over the fanned deck area
              const horizLimit = maxOffset + cardWidth * 0.65;
              const horizFade = Math.max(
                0,
                Math.min(1, (horizLimit - Math.abs(px)) / (cardWidth * 0.45))
              );
              const vertFadeTop = Math.max(0, Math.min(1, (py + 55) / 35));
              const vertFadeBottom = Math.max(0, Math.min(1, (215 - py) / 35));
              const hoverWeight = horizFade * vertFadeTop * vertFadeBottom;

              if (hoverWeight > 0.01) {
                // Offset px slightly right because each card's visible strip in a left-to-right fan is on its left side
                const hoverAnchorX = px + cardWidth * 0.22;
                const hoverNorm = Math.max(
                  0,
                  Math.min(1, (hoverAnchorX / Math.max(1, maxOffset) + 1) / 2)
                );
                const cursorFanIndex = hoverNorm * (totalUnselected - 1);
                const dist = fanStackIndex - cursorFanIndex;
                const absDist = Math.abs(dist);

                // Pronounced split: cards part cleanly to the left and right
                if (absDist < 8.5) {
                  const sigma = 3.2;
                  const wave = (dist / sigma) * Math.exp(0.5 - (dist * dist) / (2 * sigma * sigma));
                  // Pronounced split separation
                  const spreadStrength = dist > 0 ? (isMobile ? 32 : 46) : isMobile ? 18 : 26;
                  targetX += wave * spreadStrength * hoverWeight;
                }

                // Focus effect on the card directly under or nearest the cursor:
                if (absDist < 2.0) {
                  const focusStrength = (1 - absDist / 2.0) * hoverWeight;
                  // Lift card out of the deck toward user
                  targetY -= focusStrength * (isMobile ? 22 : 32);
                  targetZ += focusStrength * 45;
                  // Straighten rotation so it faces the user squarely
                  targetRotZ = lerp(targetRotZ, 0, focusStrength * 0.85);
                  targetRotX = lerp(targetRotX, 0, focusStrength * 0.85);
                  // Subtle scale and luminous highlight
                  targetScale += focusStrength * 0.09;
                  brightness += focusStrength * 0.22;
                }
              }
            }
          }
        }

        if (isBeingHeld && opacity > 0) {
          // Gentle telekinetic levitation following the pointer like an ethereal extension of mind
          body.x = lerp(body.x, pointerPosRef.current.x, 0.12);
          body.y = lerp(body.y, pointerPosRef.current.y, 0.12);
          body.z = lerp(body.z, 90, 0.08);

          const tiltX = Math.max(-5, Math.min(5, (pointerPosRef.current.y - body.y) * 0.15));
          const tiltY = Math.max(-5, Math.min(5, -(pointerPosRef.current.x - body.x) * 0.15));
          body.rotX = lerp(body.rotX, tiltX, ROTATION_SLERP_SPEED);
          body.rotY = lerp(body.rotY, tiltY, ROTATION_SLERP_SPEED);
          body.rotZ = lerp(body.rotZ, -3, ROTATION_SLERP_SPEED);
          body.scale = lerp(body.scale, 1.08, 0.08);
          blurPx = 0;
          brightness = 1.08;
        } else {
          // Fluid, telekinetic smoothing: pure serene drift towards target with zero bounce or oscillation
          let posEase = isSelected ? 0.085 : 0.072;
          let rotEase = ROTATION_SLERP_SPEED;

          // Slow, majestic transition from spinning orbit into the horizontal fanned deck:
          if (currentPhase === 'fan' && fanTransitionStartTimeRef.current !== null) {
            const fanElapsed = now - fanTransitionStartTimeRef.current;
            const FAN_TRANSITION_DURATION = 2400; // 2.4 seconds of slow, graceful, cinematic unfurling
            if (fanElapsed < FAN_TRANSITION_DURATION) {
              const t = fanElapsed / FAN_TRANSITION_DURATION;
              const easeCurve = 0.5 - 0.5 * Math.cos(t * Math.PI);
              posEase = lerp(0.016, 0.065, easeCurve);
              rotEase = lerp(0.02, ROTATION_SLERP_SPEED, easeCurve);
            }
          }

          body.x = lerp(body.x, targetX, posEase);
          body.y = lerp(body.y, targetY, posEase);
          body.z = lerp(body.z, targetZ, posEase);

          body.rotX = lerp(body.rotX, targetRotX, rotEase);
          body.rotY = lerp(body.rotY, targetRotY, rotEase);
          body.rotZ = lerp(body.rotZ, targetRotZ, rotEase);
          body.scale = lerp(body.scale, targetScale, 0.08);
        }

        const isTappedInOrbit =
          currentPhase === 'intro' && tappedOrbitCardIdRef.current === card.id;

        let companionZIndex = 175000;
        if (isInspecting && !isFocusedCard) {
          const focusedSlotIndex = currentSelected.findIndex((c) => c.card.id === inspectedId);
          let companionOrder = 1;
          if (focusedSlotIndex === 0) {
            // When inspecting PAST (0): PRESENT (1) sits on top of FUTURE (2)
            companionOrder = selectedIndex === 1 ? 2 : 1;
          } else if (focusedSlotIndex === 2) {
            // When inspecting FUTURE (2): PRESENT (1) sits on top of PAST (0)
            companionOrder = selectedIndex === 1 ? 2 : 1;
          } else {
            // When inspecting PRESENT (1): PAST (0) and FUTURE (2) flank on left and right
            companionOrder = 1;
          }
          companionZIndex = 175000 + companionOrder;
        }

        const zIndex = isBeingHeld
          ? 200000
          : isTappedInOrbit
            ? 180000
            : isSelected
              ? isInspecting
                ? isFocusedCard
                  ? 200000
                  : companionZIndex
                : 150000 + selectedIndex
              : currentPhase === 'fan' || currentPhase === 'place'
                ? 10000 + fanStackIndex
                : orbitZIndex;

        const renderX = body.x + (isTappedInOrbit ? 0 : tuckX);
        const renderY = body.y + (isTappedInOrbit ? 0 : tuckY);
        const renderRotY = body.rotY + (isTappedInOrbit ? 0 : tuckRotY);
        const renderRotZ = body.rotZ + (isTappedInOrbit ? 0 : tuckRotZ);

        const transformStr = `translate3d(${renderX.toFixed(2)}px, ${renderY.toFixed(2)}px, 0px) rotateX(${body.rotX.toFixed(2)}deg) rotateY(${renderRotY.toFixed(2)}deg) rotateZ(${renderRotZ.toFixed(2)}deg) scale(${body.scale.toFixed(3)})`;
        const filterStr =
          blurPx > 0.15
            ? `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(2)})`
            : Math.abs(brightness - 1) > 0.02
              ? `brightness(${brightness.toFixed(2)})`
              : 'none';

        el.style.transform = transformStr;
        el.style.zIndex = String(zIndex);
        el.style.opacity = String(opacity);
        el.style.filter = filterStr;
        el.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion]);

  // Fallback static styles when prefers-reduced-motion is enabled
  const getReducedMotionStyle = (cardId: string, originalIndex: number): React.CSSProperties => {
    if (!prefersReducedMotion) return {};

    const selectedIndex = selectedCards.findIndex((c) => c.card.id === cardId);
    const isSelected = selectedIndex !== -1;

    if (isSelected) {
      const isMobile = viewportWidth < 768;
      if (lightboxCardId) {
        if (cardId === lightboxCardId) {
          const isHovered = hoveredId === cardId;
          const scale = isHovered ? (isMobile ? 1.395 : 1.565) : isMobile ? 1.35 : 1.52;
          const y = isHovered ? (isMobile ? -81 : -103) : isMobile ? -78 : -100;
          return {
            transform: `translate(0px, ${y}px) scale(${scale})`,
            zIndex: 200000,
          };
        } else {
          const focusedSlotIndex = selectedCards.findIndex((c) => c.card.id === lightboxCardId);
          let fx = 0;
          const fy = isMobile ? -88 : -112;
          let frot = 0;
          const fscale = isMobile ? 1.05 : 1.16;
          let companionOrder = 1;
          if (focusedSlotIndex === 0) {
            fx = selectedIndex === 1 ? (isMobile ? 52 : 68) : isMobile ? 98 : 130;
            frot = selectedIndex === 1 ? 7.5 : 14;
            companionOrder = selectedIndex === 1 ? 2 : 1;
          } else if (focusedSlotIndex === 1) {
            fx = selectedIndex === 0 ? (isMobile ? -56 : -74) : isMobile ? 56 : 74;
            frot = selectedIndex === 0 ? -8.5 : 8.5;
            companionOrder = 1;
          } else {
            fx = selectedIndex === 1 ? (isMobile ? -52 : -68) : isMobile ? -98 : -130;
            frot = selectedIndex === 1 ? -7.5 : -14;
            companionOrder = selectedIndex === 1 ? 2 : 1;
          }
          return {
            transform: `translate(${fx}px, ${fy}px) rotate(${frot}deg) scale(${fscale})`,
            zIndex: 175000 + companionOrder,
            filter: 'brightness(0.76)',
          };
        }
      }

      const coord = getSlotCoordinate(selectedIndex, isMobile);
      return {
        transform: `translate(${coord.x}px, ${coord.y}px)`,
        zIndex: 100 + selectedIndex,
      };
    }

    if (phase === 'fan' || phase === 'place') {
      if (selectedCards.length === 3) {
        return { opacity: 0, pointerEvents: 'none' };
      }
      const selectedIds = new Set(selectedCards.map((c) => c.card.id));
      const unselectedCards = initialDeckOrder.filter((c) => !selectedIds.has(c.id));
      const fanIndex = unselectedCards.findIndex((c) => c.id === cardId);
      const totalUnselected = Math.max(1, unselectedCards.length);
      const normalized = totalUnselected > 1 ? fanIndex / (totalUnselected - 1) : 0.5;
      const spreadWidth = Math.min(viewportWidth - 40, 800);
      const cardWidth = viewportWidth < 768 ? 96 : 128;
      const maxOffset = spreadWidth / 2 - cardWidth / 2;
      const xPos = (normalized * 2 - 1) * maxOffset;
      const yPos = Math.abs(normalized - 0.5) * 40;
      const rotate = (normalized * 2 - 1) * 20;

      return {
        transform: `translate(${xPos}px, ${yPos}px) rotate(${rotate}deg)`,
        zIndex: originalIndex,
      };
    }

    return {
      transform: `translate(0px, ${-originalIndex * 0.2}px)`,
      zIndex: originalIndex,
    };
  };

  // Pointer & Circular Swirl Detection Handlers
  const getRelativePointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0, canvasX: 0, canvasY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return {
      x: clientX - centerX,
      y: clientY - centerY,
      canvasX: clientX - rect.left,
      canvasY: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent, cardId?: string) => {
    isPointerDownRef.current = true;
    isPointerInsideRef.current = true;
    dragDistanceRef.current = 0;
    suppressedHoverCardIdRef.current = null;
    suppressAllHoverUntilMoveRef.current = false;
    const pos = getRelativePointer(e.clientX, e.clientY);
    prevPointerPosRef.current = { x: pos.x, y: pos.y };
    prevPointerAngleRef.current = Math.atan2(pos.y, pos.x);

    if (cardId && (phase === 'intro' || phase === 'fan' || phase === 'place')) {
      const isSelected = selectedCards.some((c) => c.card.id === cardId);
      if (!isSelected) {
        heldCardIdRef.current = cardId;
        hoveredIdRef.current = null;
        setHoveredId(null);
      }
    }

    const liftY = heldCardIdRef.current && (phase === 'fan' || phase === 'place') ? -38 : 0;
    pointerPosRef.current = { x: pos.x, y: pos.y + liftY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    isPointerInsideRef.current = true;
    const pos = getRelativePointer(e.clientX, e.clientY);
    const dx = pos.x - prevPointerPosRef.current.x;
    const dy = pos.y - prevPointerPosRef.current.y;
    const speed = Math.hypot(dx, dy);

    if (!isPointerDownRef.current && suppressAllHoverUntilMoveRef.current) {
      const distFromDrop = Math.hypot(
        pos.x - dropPointerPosRef.current.x,
        pos.y - dropPointerPosRef.current.y
      );
      if (distFromDrop > 14) {
        suppressAllHoverUntilMoveRef.current = false;
      }
    }

    if (speed > 2 && emitterRef.current) {
      emitterRef.current.spawnBurst(
        pos.canvasX,
        pos.canvasY,
        dx,
        dy,
        isPointerDownRef.current ? 4 : 1
      );
    }

    if (isPointerDownRef.current) {
      dragDistanceRef.current += speed;
      // Lift held card slightly above the pointer in fan phase so the user clearly sees the parted slot in the deck below
      const liftY = heldCardIdRef.current && (phase === 'fan' || phase === 'place') ? -38 : 0;
      pointerPosRef.current = { x: pos.x, y: pos.y + liftY };

      // When holding and moving a card over the fanned deck, dynamically slot it into the fan at the cursor's X position
      if (heldCardIdRef.current && (phase === 'fan' || phase === 'place')) {
        const heldId = heldCardIdRef.current;
        const vw = viewportWidthRef.current;
        const isMobile = vw < 768;
        const spreadWidth = Math.min(vw - 32, 820);
        const cardWidth = isMobile ? 96 : 128;
        const maxOffset = Math.max(1, spreadWidth / 2 - cardWidth / 2);

        const selectedSet = new Set(selectedCardsRef.current.map((c) => c.card.id));
        const unselected = fanDeckOrderRef.current.filter((c) => !selectedSet.has(c.id));
        const totalUnselected = unselected.length;

        if (totalUnselected > 1) {
          const clampedNormalized = Math.max(0, Math.min(1, (pos.x / maxOffset + 1) / 2));
          const targetUnselectedIndex = Math.round(clampedNormalized * (totalUnselected - 1));
          const currentUnselectedIndex = unselected.findIndex((c) => c.id === heldId);

          if (currentUnselectedIndex !== -1 && currentUnselectedIndex !== targetUnselectedIndex) {
            const heldCardObj = unselected[currentUnselectedIndex];
            const reorderedUnselected = [...unselected];
            reorderedUnselected.splice(currentUnselectedIndex, 1);
            reorderedUnselected.splice(targetUnselectedIndex, 0, heldCardObj);

            const selectedInDeck = fanDeckOrderRef.current.filter((c) => selectedSet.has(c.id));
            fanDeckOrderRef.current = [...reorderedUnselected, ...selectedInDeck];
          }
        }
      }

      const currentAngle = Math.atan2(pos.y, pos.x);
      if (prevPointerAngleRef.current !== null) {
        let deltaAngle = currentAngle - prevPointerAngleRef.current;
        while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

        if (Math.abs(deltaAngle) < 0.8 && Math.abs(deltaAngle) > 0.001) {
          spinDirectionRef.current = deltaAngle >= 0 ? 1 : -1;
          orbitVelocityRef.current += deltaAngle * 0.16;
          orbitVelocityRef.current = Math.max(-0.12, Math.min(0.12, orbitVelocityRef.current));
        }
      }
      prevPointerAngleRef.current = currentAngle;

      // Single swipe across the ring or cards triggers the ring spin & shuffle progression
      if (phase === 'intro' && !hasTriggeredShuffleRef.current) {
        swirlAccumulatorRef.current = Math.min(
          SWIPE_DISTANCE_THRESHOLD,
          swirlAccumulatorRef.current + speed
        );
        const progress = swirlAccumulatorRef.current / SWIPE_DISTANCE_THRESHOLD;
        if (containerRef.current) {
          containerRef.current.style.setProperty(
            '--swirl-progress',
            `${Math.min(100, Math.round(progress * 100))}%`
          );
          containerRef.current.style.setProperty('--swirl-opacity', progress > 0.02 ? '1' : '0');
        }

        if (swirlAccumulatorRef.current >= SWIPE_DISTANCE_THRESHOLD) {
          hasTriggeredShuffleRef.current = true;
          heldCardIdRef.current = null;
          if (containerRef.current) {
            containerRef.current.style.setProperty('--swirl-progress', '0%');
            containerRef.current.style.setProperty('--swirl-opacity', '0');
          }
          onStartShuffle();
        }
      }
    }

    prevPointerPosRef.current = { x: pos.x, y: pos.y };
  };

  const handlePointerUp = () => {
    if (heldCardIdRef.current && dragDistanceRef.current > 6) {
      // Disable hover on release so the user clearly sees the moved card slide down into the fanned deck at its new location
      suppressedHoverCardIdRef.current = heldCardIdRef.current;
      suppressAllHoverUntilMoveRef.current = true;
      dropPointerPosRef.current = { ...prevPointerPosRef.current };
      hoveredIdRef.current = null;
      setHoveredId(null);
    }
    isPointerDownRef.current = false;
    heldCardIdRef.current = null;
    prevPointerAngleRef.current = null;
  };

  const selectedIds = new Set(selectedCards.map((c) => c.card.id));

  const handleCardClick = (cardId: string) => {
    if (dragDistanceRef.current > 18) return;

    if (phase === 'intro') {
      ritualAudio.playCardSelect();
      setTappedOrbitCardId((prev) => (prev === cardId ? null : cardId));
      return;
    }

    if ((phase === 'fan' || phase === 'place') && selectedCards.length < 3) {
      if (!selectedIds.has(cardId)) {
        ritualAudio.playCardSelect();
        onSelectCard(cardId);
        setHoveredId(null);
      }
    } else if (phase === 'place' || phase === 'read') {
      const isSelected = selectedIds.has(cardId);
      const card = selectedCards.find((c) => c.card.id === cardId);
      if (isSelected && card) {
        ritualAudio.playCardSelect();
        if (lightboxCardId) {
          // In single-card inspect view:
          if (cardId !== lightboxCardId) {
            // Tapping on one of the other cards just brings that to the front
            // If it's not been turned, it will come to the front face down
            setLightboxCardId(cardId);
          } else {
            // Tapping on the card currently at the front turns it over if not yet revealed
            if (!card.isRevealed) {
              onFlipCard(cardId);
            }
          }
        } else {
          // In 3-card spread view:
          if (!card.isRevealed) {
            // First tap: Turn the card over right in the 3-card spread
            onFlipCard(cardId);
          } else {
            // Second tap: Open the single-card focus view
            setLightboxCardId(cardId);
          }
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => {
        isPointerInsideRef.current = false;
      }}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      {/* 3D Astrolabe Orbital Paths, Target Nodes, Golden Comet Arcs & Stardust */}
      <StardustCanvas emitterRef={emitterRef} />

      {/* Placed Cards Guidance */}
      <ReadingGuidance phase={phase} selectedCount={selectedCards.length} />

      {/* The 3D Antigravity Deck Container */}
      <div
        className={`relative w-24 h-36 md:w-32 md:h-48 perspective-1000 ${lightboxCardId ? 'z-[160000]' : 'z-30'}`}
      >
        {/* Spread Slots matched to absolute math */}
        <ReadingSlots
          phase={phase}
          selectedCards={selectedCards}
          viewportWidth={viewportWidth}
          onCardClick={handleCardClick}
          isInspecting={!!lightboxCardId}
        />

        {initialDeckOrder.map((card, index) => {
          const selectedCard = selectedCards.find((c) => c.card.id === card.id);
          const isSelected = !!selectedCard;

          let isInteractable = false;
          if (phase === 'intro' && index < VISIBLE_ORBIT_CARDS) {
            isInteractable = true;
          } else if (
            (phase === 'fan' || phase === 'place') &&
            !isSelected &&
            selectedCards.length < 3
          ) {
            isInteractable = true;
          } else if ((phase === 'place' || phase === 'read') && isSelected) {
            isInteractable = true;
          }

          return (
            <div
              key={card.id}
              ref={(el) => {
                if (el) {
                  cardNodeRefs.current.set(card.id, el);
                } else {
                  cardNodeRefs.current.delete(card.id);
                }
              }}
              style={getReducedMotionStyle(card.id, index)}
              className={`absolute top-0 left-0 w-full h-full transform-gpu outline-none will-change-transform ${
                isInteractable
                  ? isSelected
                    ? 'cursor-pointer'
                    : phase === 'intro'
                      ? 'cursor-pointer'
                      : 'cursor-grab active:cursor-grabbing'
                  : ''
              }`}
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown(e, card.id);
              }}
              onMouseEnter={() => {
                if (
                  !isInteractable ||
                  isPointerDownRef.current ||
                  suppressAllHoverUntilMoveRef.current
                ) {
                  return;
                }
                if (suppressedHoverCardIdRef.current === card.id) {
                  return;
                }
                suppressedHoverCardIdRef.current = null;
                setHoveredId(card.id);
              }}
              onMouseLeave={() => {
                if (!isInteractable) return;
                if (
                  !suppressAllHoverUntilMoveRef.current &&
                  suppressedHoverCardIdRef.current === card.id
                ) {
                  suppressedHoverCardIdRef.current = null;
                }
                setHoveredId(null);
              }}
              onFocus={() => isInteractable && setHoveredId(card.id)}
              onBlur={() => isInteractable && setHoveredId(null)}
              role={isInteractable ? 'button' : 'presentation'}
              tabIndex={isInteractable ? 0 : -1}
              aria-hidden={!isInteractable ? true : undefined}
              aria-label={isInteractable ? `Select Tarot Card` : undefined}
              onKeyDown={(e) => {
                if (isInteractable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  dragDistanceRef.current = 0;
                  if (phase === 'intro') {
                    onStartShuffle();
                  } else {
                    handleCardClick(card.id);
                  }
                }
              }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Specular corner starburst glint on hovered or key foreground cards */}
              {isInteractable &&
                ((hoveredId === card.id &&
                  !suppressAllHoverUntilMoveRef.current &&
                  suppressedHoverCardIdRef.current !== card.id) ||
                  (phase === 'intro' && tappedOrbitCardId === card.id) ||
                  (phase === 'intro' && index % 6 === 0)) && (
                  <div
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full pointer-events-none z-50"
                    style={{
                      background:
                        'radial-gradient(circle, #ffffff 0%, rgba(255,225,150,0.8) 40%, transparent 75%)',
                      boxShadow: '0 0 10px 2px rgba(255, 225, 150, 0.85)',
                    }}
                  />
                )}
              <TarotCardView
                card={card}
                imageUrl={card.imageUrl}
                orientation={selectedCard?.orientation || 'upright'}
                isFlipped={
                  (phase === 'intro' && tappedOrbitCardId === card.id) ||
                  selectedCard?.isRevealed ||
                  false
                }
                className={
                  isInteractable
                    ? isSelected
                      ? 'cursor-pointer pointer-events-none'
                      : 'cursor-grab active:cursor-grabbing pointer-events-none'
                    : 'pointer-events-none'
                }
              />
            </div>
          );
        })}
      </div>

      {/* Bottom-Right Minimalist 'SWIRL TO SHUFFLE' / 'RESHUFFLE DECK' / 'CLEAR & RESTART' Typography */}
      <ShuffleControl
        phase={phase}
        onStartShuffle={onStartShuffle}
        onResetReading={onResetReading}
      />

      {/* Lightbox Focus View when a placed card is revealed or clicked */}
      {(() => {
        if (!lightboxCardId) return null;
        const activeCard = selectedCards.find((c) => c.card.id === lightboxCardId);
        const slotIdx = selectedCards.findIndex((c) => c.card.id === lightboxCardId);
        if (!activeCard || slotIdx === -1) return null;

        return (
          <CardDetailLightbox
            positionedCard={activeCard}
            slotIndex={slotIdx}
            allSelectedCards={selectedCards}
            onSelectSlot={(idx) => {
              const target = selectedCards[idx];
              if (target) {
                ritualAudio.playCardSelect();
                setLightboxCardId(target.card.id);
              }
            }}
            onFlipCard={onFlipCard}
            onClose={() => setLightboxCardId(null)}
          />
        );
      })()}
    </div>
  );
};
