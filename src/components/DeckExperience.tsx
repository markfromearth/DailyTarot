import React, { useState, useEffect, useRef } from 'react';
import { ShuffleControl } from './ShuffleControl';
import { ReadingGuidance } from './ReadingGuidance';
import { ReadingSlots } from './ReadingSlots';
import { TarotCardView } from './TarotCardView';
import { CardDetailLightbox } from './CardDetailLightbox';
import { StardustCanvas, StardustEmitterHandle } from './StardustCanvas';
import { ReadingPhase, TarotCard, PositionedCard } from '../types/tarot';
import { ritualAudio } from '../engine/sound';

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

const FLOAT_STRENGTH = 0.5;
const HOVER_DAMPING = 0.9;
const ROTATION_SLERP_SPEED = 0.15;
const DRAG_SPEED = 0.22;
const SWIPE_DISTANCE_THRESHOLD = 45; // Single swipe distance in px to spin the ring and trigger shuffle
const VISIBLE_ORBIT_CARDS = 50; // 50 visible cards orbiting in the 3D ring
const TILT_RAD = -21 * (Math.PI / 180); // 21-degree diagonal banking angle
const IDLE_ORBIT_VELOCITY = -0.0026; // Gentle, meditative counter-clockwise orbital drift

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
  onResetReading
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
  );

  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1024)
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tappedOrbitCardId, setTappedOrbitCardId] = useState<string | null>(null);
  const [swirlProgress, setSwirlProgress] = useState(0);
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

  useEffect(() => {
    fanDeckOrderRef.current = [...initialDeckOrder];
  }, [initialDeckOrder]);

  useEffect(() => {
    if (phase === 'intro') {
      swirlAccumulatorRef.current = 0;
      hasTriggeredShuffleRef.current = false;
      shuffleStartTimeRef.current = null;
      heldCardIdRef.current = null;
      suppressedHoverCardIdRef.current = null;
      suppressAllHoverUntilMoveRef.current = false;
      hoveredIdRef.current = null;
      setHoveredId(null);
      setTappedOrbitCardId(null);
      setSwirlProgress(0);
      setLightboxCardId(null);
    } else if (phase === 'shuffling') {
      shuffleStartTimeRef.current = performance.now();
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
        setLightboxCardId(null);
      }
    }
  }, [phase]);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
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

      const selectedIds = new Set(currentSelected.map(c => c.card.id));

      // Update orbital carousel velocity & angle
      if (currentPhase === 'intro') {
        orbitAngleRef.current += orbitVelocityRef.current;
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, IDLE_ORBIT_VELOCITY, 0.03);
      } else if (currentPhase === 'shuffling') {
        // First spin the full ring rapidly, then contract into the shuffle cascade
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, spinDirectionRef.current * 0.18, 0.08);
        orbitAngleRef.current += orbitVelocityRef.current;
      } else {
        orbitVelocityRef.current = lerp(orbitVelocityRef.current, -0.002, 0.05);
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
      const cosTilt = Math.cos(TILT_RAD);
      const sinTilt = Math.sin(TILT_RAD);

      // During shuffling (1500ms total):
      // 0ms - 650ms: Full ring spins rapidly at full radius (mergeFactor = 1)
      // 650ms - 1500ms: Ring contracts smoothly into the center shuffle vortex before fanning out
      let mergeFactor = 1;
      if (currentPhase === 'shuffling' && shuffleStartTimeRef.current !== null) {
        const elapsed = now - shuffleStartTimeRef.current;
        if (elapsed > 650) {
          const t = Math.min(1, (elapsed - 650) / 800);
          mergeFactor = Math.max(0.08, 1 - t * t * 0.92);
        }
      }

      const stepAngle = (Math.PI * 2) / VISIBLE_ORBIT_CARDS;

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
            scale: 1
          };
          bodiesRef.current.set(card.id, body);
        }

        const selectedIndex = currentSelected.findIndex(c => c.card.id === card.id);
        const isSelected = selectedIndex !== -1;
        const isBeingHeld = heldCardIdRef.current === card.id && currentPhase !== 'intro' && currentPhase !== 'shuffling';

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

        if (isSelected) {
          // Placed slot position at the top
          const cardWidth = isMobile ? 96 : 128;
          const spacing = isMobile ? 10 : 20;
          const totalWidth = cardWidth * 3 + spacing * 2;
          const startX = -(totalWidth / 2) + cardWidth / 2;

          targetX = startX + selectedIndex * (cardWidth + spacing);
          targetY = isMobile ? -190 : -220;
          targetZ = 60;
          targetRotX = 0;
          targetRotY = 0;
          targetRotZ = 0;
        } else if (currentPhase === 'intro' || currentPhase === 'shuffling') {
          if (index >= VISIBLE_ORBIT_CARDS) {
            opacity = 0;
            targetScale = 0.5;
          } else {
            const theta = (index / VISIBLE_ORBIT_CARDS) * Math.PI * 2 + orbitAngleRef.current;

            // Signed angular distance in [-PI, PI] from the front apex (+PI / 2) and back apex (-PI / 2)
            const deltaFromApex = Math.atan2(
              Math.sin(theta - Math.PI / 2),
              Math.cos(theta - Math.PI / 2)
            );
            const deltaFromBack = Math.atan2(
              Math.sin(theta + Math.PI / 2),
              Math.cos(theta + Math.PI / 2)
            );

            // C2-smooth raised-cosine bell (0 value, 0 velocity, and 0 acceleration at both ends u = ±1)
            // Half-width of 0.72 * stepAngle lets the ease-in and ease-out tails overlap smoothly across the apex
            // so one card's upcoming and retreating motions blend into a single fluid glide without abrupt starts/stops.
            const tuckHalfWidth = stepAngle * 0.72;
            const smoothTuckBell = (delta: number, center: number): number => {
              const u = (delta - center) / tuckHalfWidth;
              if (u <= -1 || u >= 1) return 0;
              const c = Math.cos(u * Math.PI * 0.5);
              return c * c * c;
            };

            const frontRetreatBell = smoothTuckBell(deltaFromApex, -0.5 * stepAngle);
            const frontUpcomingBell = smoothTuckBell(deltaFromApex, 0.5 * stepAngle);
            const backRetreatBell = smoothTuckBell(deltaFromBack, -0.5 * stepAngle);
            const backUpcomingBell = smoothTuckBell(deltaFromBack, 0.5 * stepAngle);

            if (frontRetreatBell > 0 || frontUpcomingBell > 0) {
              const sweepDist =
                ((isMobile ? 65 : 78) * frontRetreatBell -
                  (isMobile ? 49 : 58) * frontUpcomingBell) *
                mergeFactor;
              tuckX = sweepDist * cosTilt;
              tuckY = sweepDist * sinTilt;
              tuckRotY = (-12 * frontRetreatBell + 9 * frontUpcomingBell) * mergeFactor;
              tuckRotZ = (-3.9 * frontRetreatBell - 2.1 * frontUpcomingBell) * mergeFactor;
            } else if (backRetreatBell > 0 || backUpcomingBell > 0) {
              const sweepDistBack =
                (-(isMobile ? 36 : 38) * backRetreatBell +
                  (isMobile ? 26 : 28) * backUpcomingBell) *
                mergeFactor;
              tuckX = sweepDistBack * cosTilt;
              tuckY = sweepDistBack * sinTilt;
              tuckRotY = (8 * backRetreatBell - 6 * backUpcomingBell) * mergeFactor;
              tuckRotZ = (-2.1 * backRetreatBell - 3.9 * backUpcomingBell) * mergeFactor;
            }

            if (deltaFromApex >= -stepAngle && deltaFromApex < 0) {
              orbitZIndex = deltaFromApex > -0.5 * stepAngle ? 95000 : 88500;
            } else if (deltaFromApex >= 0 && deltaFromApex < stepAngle) {
              orbitZIndex = 90000;
            } else if (deltaFromBack >= -stepAngle && deltaFromBack < 0) {
              orbitZIndex = deltaFromBack > -0.5 * stepAngle ? 36000 : 38500;
            } else if (deltaFromBack >= 0 && deltaFromBack < stepAngle) {
              orbitZIndex = 37500;
            } else {
              orbitZIndex = Math.round(85000 - Math.abs(deltaFromApex) * 15000) + index;
            }

            // Un-tilted ellipse coordinates
            const lx = Math.cos(theta) * rx * mergeFactor;
            const ly = Math.sin(theta) * ry * mergeFactor;

            // Apply -21deg diagonal banking rotation to the entire ring
            const bobbing = Math.sin(timeSec * 1.9 + index * 0.7) * FLOAT_STRENGTH * 9 * mergeFactor;
            targetX = (lx * cosTilt - ly * sinTilt) - (isMobile ? 10 : 35) * mergeFactor;
            targetY = (lx * sinTilt + ly * cosTilt) + bobbing;
            targetZ = Math.sin(theta) * rz * mergeFactor;

            // Depth norm: +1 at closest foreground (bottom-right), -1 at furthest background (top-left)
            const depthNorm = Math.sin(theta);

            // Tangential 3D card orientation along the banked ring
            targetRotY = -Math.cos(theta) * 26 * mergeFactor;
            targetRotX = (8 - depthNorm * 6) * mergeFactor;
            targetRotZ = (-18 + Math.cos(theta) * 14) * mergeFactor;

            // Perspective scale & optical depth-of-field dimming on back-half cards
            targetScale = 0.72 + (depthNorm + 1) * 0.24 * mergeFactor;
            if (depthNorm < -0.15) {
              blurPx = Math.abs(depthNorm + 0.15) * 1.8 * mergeFactor;
              brightness = 0.65 + (depthNorm + 1) * 0.3;
            }

            // If this card is tapped (or hovered) in the ring, make it rise gracefully from the ring
            if (
              currentPhase === 'intro' &&
              (tappedOrbitCardIdRef.current === card.id || hoveredIdRef.current === card.id)
            ) {
              const isTapped = tappedOrbitCardIdRef.current === card.id;
              if (isTapped) {
                targetY -= isMobile ? 85 : 110;
                targetZ = 95;
                targetRotX = 0;
                targetRotY = 0;
                targetRotZ = 0;
                targetScale = isMobile ? 1.25 : 1.38;
                blurPx = 0;
                brightness = 1.15;
              } else {
                targetY -= 34;
                targetScale += 0.08;
                blurPx = 0;
                brightness = 1.15;
              }
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
            const unselectedCards = fanDeckOrderRef.current.filter(c => !selectedIds.has(c.id));
            const fanIndex = unselectedCards.findIndex(c => c.id === card.id);
            fanStackIndex = fanIndex !== -1 ? fanIndex : index;
            const totalUnselected = Math.max(1, unselectedCards.length);
            const normalized = totalUnselected > 1 ? fanStackIndex / (totalUnselected - 1) : 0.5;

            const spreadWidth = Math.min(vw - 32, 820);
            const cardWidth = isMobile ? 96 : 128;
            const maxOffset = spreadWidth / 2 - cardWidth / 2;

            const bobbing = Math.sin(timeSec * 1.6 + fanStackIndex * 0.4) * FLOAT_STRENGTH * 10;
            targetX = (normalized * 2 - 1) * maxOffset;
            targetY = Math.abs(normalized - 0.5) * (isMobile ? 48 : 72) + bobbing + 50;
            targetZ = (1 - Math.abs(normalized - 0.5) * 2) * 35;
            targetRotZ = (normalized * 2 - 1) * (isMobile ? 18 : 26);

            if (heldCardIdRef.current) {
              const activeFanIndex = unselectedCards.findIndex(
                c => c.id === heldCardIdRef.current
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
              totalUnselected > 1
            ) {
              // Smoothly separate fanned cards around the cursor to reveal the card underneath without lifting
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

                if (Math.abs(dist) < 7.5) {
                  const sigma = 2.4;
                  const wave =
                    (dist / sigma) * Math.exp(0.5 - (dist * dist) / (2 * sigma * sigma));
                  // Cards to the right (dist > 0) overlap on top of the card under the cursor, so push them further right to uncover it
                  const spreadStrength = dist > 0 ? (isMobile ? 22 : 30) : isMobile ? 10 : 14;
                  targetX += wave * spreadStrength * hoverWeight;
                }
              }
            }
          }
        }

        if (isBeingHeld && opacity > 0) {
          const pullX = pointerPosRef.current.x - body.x;
          const pullY = pointerPosRef.current.y - body.y;
          body.vx = pullX * DRAG_SPEED;
          body.vy = pullY * DRAG_SPEED;
          body.x += body.vx;
          body.y += body.vy;
          body.z = lerp(body.z, 120, 0.2);

          const tiltX = Math.max(-20, Math.min(20, body.vy * 1.2));
          const tiltY = Math.max(-20, Math.min(20, -body.vx * 1.2));
          body.rotX = lerp(body.rotX, tiltX, ROTATION_SLERP_SPEED);
          body.rotY = lerp(body.rotY, tiltY, ROTATION_SLERP_SPEED);
          body.rotZ = lerp(body.rotZ, -12, ROTATION_SLERP_SPEED);
          body.scale = lerp(body.scale, 1.15, 0.2);
          blurPx = 0;
          brightness = 1.1;
        } else {
          const springFactor = isSelected ? 0.14 : 0.12;
          body.vx = (body.vx + (targetX - body.x) * springFactor) * HOVER_DAMPING;
          body.vy = (body.vy + (targetY - body.y) * springFactor) * HOVER_DAMPING;
          body.vz = (body.vz + (targetZ - body.z) * springFactor) * HOVER_DAMPING;

          body.x += body.vx * 0.38;
          body.y += body.vy * 0.38;
          body.z += body.vz * 0.38;

          body.rotX = lerp(body.rotX, targetRotX, ROTATION_SLERP_SPEED);
          body.rotY = lerp(body.rotY, targetRotY, ROTATION_SLERP_SPEED);
          body.rotZ = lerp(body.rotZ, targetRotZ, ROTATION_SLERP_SPEED);
          body.scale = lerp(body.scale, targetScale, 0.16);
        }

        const isTappedInOrbit = currentPhase === 'intro' && tappedOrbitCardIdRef.current === card.id;
        const zIndex = isBeingHeld
          ? 200000
          : isTappedInOrbit
          ? 180000
          : isSelected
          ? 150000 + selectedIndex
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

    const selectedIndex = selectedCards.findIndex(c => c.card.id === cardId);
    const isSelected = selectedIndex !== -1;

    if (isSelected) {
      const cardWidth = viewportWidth < 768 ? 96 : 128;
      const spacing = viewportWidth < 768 ? 10 : 20;
      const totalWidth = cardWidth * 3 + spacing * 2;
      const startX = -(totalWidth / 2) + cardWidth / 2;
      const xPos = startX + selectedIndex * (cardWidth + spacing);
      const yPos = viewportWidth < 768 ? -190 : -220;

      return {
        transform: `translate(${xPos}px, ${yPos}px)`,
        zIndex: 100 + selectedIndex
      };
    }

    if (phase === 'fan' || phase === 'place') {
      if (selectedCards.length === 3) {
        return { opacity: 0, pointerEvents: 'none' };
      }
      const selectedIds = new Set(selectedCards.map(c => c.card.id));
      const unselectedCards = initialDeckOrder.filter(c => !selectedIds.has(c.id));
      const fanIndex = unselectedCards.findIndex(c => c.id === cardId);
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
        zIndex: originalIndex
      };
    }

    return {
      transform: `translate(0px, ${-originalIndex * 0.2}px)`,
      zIndex: originalIndex
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
      canvasY: clientY - rect.top
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
      const isSelected = selectedCards.some(c => c.card.id === cardId);
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

        const selectedSet = new Set(selectedCardsRef.current.map(c => c.card.id));
        const unselected = fanDeckOrderRef.current.filter(c => !selectedSet.has(c.id));
        const totalUnselected = unselected.length;

        if (totalUnselected > 1) {
          const clampedNormalized = Math.max(0, Math.min(1, (pos.x / maxOffset + 1) / 2));
          const targetUnselectedIndex = Math.round(clampedNormalized * (totalUnselected - 1));
          const currentUnselectedIndex = unselected.findIndex(c => c.id === heldId);

          if (currentUnselectedIndex !== -1 && currentUnselectedIndex !== targetUnselectedIndex) {
            const heldCardObj = unselected[currentUnselectedIndex];
            const reorderedUnselected = [...unselected];
            reorderedUnselected.splice(currentUnselectedIndex, 1);
            reorderedUnselected.splice(targetUnselectedIndex, 0, heldCardObj);

            const selectedInDeck = fanDeckOrderRef.current.filter(c => selectedSet.has(c.id));
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
          orbitVelocityRef.current += deltaAngle * 0.35;
          orbitVelocityRef.current = Math.max(-0.24, Math.min(0.24, orbitVelocityRef.current));
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
        setSwirlProgress(progress);

        if (swirlAccumulatorRef.current >= SWIPE_DISTANCE_THRESHOLD) {
          hasTriggeredShuffleRef.current = true;
          heldCardIdRef.current = null;
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

  const selectedIds = new Set(selectedCards.map(c => c.card.id));

  const handleCardClick = (cardId: string) => {
    if (dragDistanceRef.current > 18) return;

    if (phase === 'intro') {
      ritualAudio.playCardSelect();
      setTappedOrbitCardId(prev => (prev === cardId ? null : cardId));
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
      const card = selectedCards.find(c => c.card.id === cardId);
      if (isSelected && card) {
        ritualAudio.playCardSelect();
        if (!card.isRevealed) {
          onFlipCard(cardId);
        }
        setLightboxCardId(cardId);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={e => handlePointerDown(e)}
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
      <div className="relative w-24 h-36 md:w-32 md:h-48 perspective-1000 z-30">
        {/* Spread Slots matched to absolute math */}
        <ReadingSlots
          phase={phase}
          selectedCards={selectedCards}
          viewportWidth={viewportWidth}
          onCardClick={handleCardClick}
        />

        {initialDeckOrder.map((card, index) => {
          const selectedCard = selectedCards.find(c => c.card.id === card.id);
          const isSelected = !!selectedCard;

          let isInteractable = false;
          if (phase === 'intro' && index < VISIBLE_ORBIT_CARDS) {
            isInteractable = true;
          } else if ((phase === 'fan' || phase === 'place') && !isSelected && selectedCards.length < 3) {
            isInteractable = true;
          } else if ((phase === 'place' || phase === 'read') && isSelected) {
            isInteractable = true;
          }

          return (
            <div
              key={card.id}
              ref={el => {
                if (el) {
                  cardNodeRefs.current.set(card.id, el);
                } else {
                  cardNodeRefs.current.delete(card.id);
                }
              }}
              style={getReducedMotionStyle(card.id, index)}
              className="absolute top-0 left-0 w-full h-full transform-gpu outline-none will-change-transform"
              onPointerDown={e => {
                e.stopPropagation();
                handlePointerDown(e, card.id);
              }}
              onMouseEnter={() => {
                if (!isInteractable || isPointerDownRef.current || suppressAllHoverUntilMoveRef.current) {
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
                if (!suppressAllHoverUntilMoveRef.current && suppressedHoverCardIdRef.current === card.id) {
                  suppressedHoverCardIdRef.current = null;
                }
                setHoveredId(null);
              }}
              onFocus={() => isInteractable && setHoveredId(card.id)}
              onBlur={() => isInteractable && setHoveredId(null)}
              role={isInteractable ? 'button' : 'presentation'}
              tabIndex={isInteractable ? 0 : -1}
              aria-label={isInteractable ? `Select Tarot Card` : undefined}
              onKeyDown={e => {
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
                      background: 'radial-gradient(circle, #ffffff 0%, rgba(255,225,150,0.8) 40%, transparent 75%)',
                      boxShadow: '0 0 10px 2px rgba(255, 225, 150, 0.85)'
                    }}
                  />
                )}
              <TarotCardView
                card={card}
                imageUrl={card.imageUrl}
                orientation={selectedCard?.orientation || 'upright'}
                isFlipped={(phase === 'intro' && tappedOrbitCardId === card.id) || (selectedCard?.isRevealed || false)}
                className={isInteractable ? (isSelected ? 'cursor-pointer pointer-events-none' : 'cursor-grab active:cursor-grabbing pointer-events-none') : 'pointer-events-none'}
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
        swirlProgress={swirlProgress}
      />

      {/* Lightbox Focus View when a placed card is revealed or clicked */}
      {(() => {
        if (!lightboxCardId) return null;
        const activeCard = selectedCards.find(c => c.card.id === lightboxCardId);
        const slotIdx = selectedCards.findIndex(c => c.card.id === lightboxCardId);
        if (!activeCard || slotIdx === -1) return null;

        return (
          <CardDetailLightbox
            positionedCard={activeCard}
            slotIndex={slotIdx}
            allSelectedCards={selectedCards}
            onSelectSlot={idx => {
              const target = selectedCards[idx];
              if (target) {
                ritualAudio.playCardSelect();
                if (!target.isRevealed) {
                  onFlipCard(target.card.id);
                }
                setLightboxCardId(target.card.id);
              }
            }}
            onClose={() => setLightboxCardId(null)}
          />
        );
      })()}
    </div>
  );
};
