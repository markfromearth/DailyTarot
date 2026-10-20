/**
 * Kinematics and 3D geometric projection engine for DailyTarot.
 * Pure mathematical functions decoupled from React state, DOM, and browser globals.
 */

export interface KinematicTransform {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  opacity: number;
  zIndex: number;
  brightness: number;
  blurPx: number;
  tuckX?: number;
  tuckY?: number;
  tuckRotY?: number;
  tuckRotZ?: number;
}

export interface OrbitConfig {
  rx: number;
  ry: number;
  rz: number;
  tiltRad: number;
  mergeFactor: number;
  shuffleWobbleAmp: number;
  isMobile: boolean;
  visibleOrbitCards: number;
}

export interface FanConfig {
  fanStackIndex: number;
  totalUnselected: number;
  maxOffset: number;
  cardWidth: number;
  isMobile: boolean;
  timeSec: number;
}

export interface TuckOffset {
  tuckX: number;
  tuckY: number;
  tuckRotY: number;
  tuckRotZ: number;
  orbitZIndex: number;
}

/**
 * C2-smooth raised-cosine bell (0 value, 0 velocity, and 0 acceleration at ends u = ±1).
 */
export function smoothTuckBell(delta: number, center: number, halfWidth: number): number {
  const u = (delta - center) / halfWidth;
  if (u <= -1 || u >= 1) return 0;
  const c = Math.cos(u * Math.PI * 0.5);
  return c * c * c;
}

/**
 * Calculates tuck offsets and apex z-index ordering for cards near orbital apexes.
 */
export function calculateTuckOffset(
  theta: number,
  stepAngle: number,
  mergeFactor: number,
  isMobile: boolean,
  cosTilt: number,
  sinTilt: number,
  cardIndex: number
): TuckOffset {
  const deltaFromApex = Math.atan2(Math.sin(theta - Math.PI / 2), Math.cos(theta - Math.PI / 2));
  const deltaFromBack = Math.atan2(Math.sin(theta + Math.PI / 2), Math.cos(theta + Math.PI / 2));

  const tuckHalfWidth = stepAngle * 0.72;
  const frontRetreatBell = smoothTuckBell(deltaFromApex, -0.5 * stepAngle, tuckHalfWidth);
  const frontUpcomingBell = smoothTuckBell(deltaFromApex, 0.5 * stepAngle, tuckHalfWidth);
  const backRetreatBell = smoothTuckBell(deltaFromBack, -0.5 * stepAngle, tuckHalfWidth);
  const backUpcomingBell = smoothTuckBell(deltaFromBack, 0.5 * stepAngle, tuckHalfWidth);

  let tuckX = 0;
  let tuckY = 0;
  let tuckRotY = 0;
  let tuckRotZ = 0;

  if (frontRetreatBell > 0 || frontUpcomingBell > 0) {
    const sweepDist =
      ((isMobile ? 65 : 78) * frontRetreatBell - (isMobile ? 49 : 58) * frontUpcomingBell) *
      mergeFactor;
    tuckX = sweepDist * cosTilt;
    tuckY = sweepDist * sinTilt;
    tuckRotY = (-12 * frontRetreatBell + 9 * frontUpcomingBell) * mergeFactor;
    tuckRotZ = (-3.9 * frontRetreatBell - 2.1 * frontUpcomingBell) * mergeFactor;
  } else if (backRetreatBell > 0 || backUpcomingBell > 0) {
    const sweepDistBack =
      (-(isMobile ? 36 : 38) * backRetreatBell + (isMobile ? 26 : 28) * backUpcomingBell) *
      mergeFactor;
    tuckX = sweepDistBack * cosTilt;
    tuckY = sweepDistBack * sinTilt;
    tuckRotY = (8 * backRetreatBell - 6 * backUpcomingBell) * mergeFactor;
    tuckRotZ = (-2.1 * backRetreatBell - 3.9 * backUpcomingBell) * mergeFactor;
  }

  let orbitZIndex: number;
  if (deltaFromApex >= -stepAngle && deltaFromApex < 0) {
    orbitZIndex = deltaFromApex > -0.5 * stepAngle ? 95000 : 88500;
  } else if (deltaFromApex >= 0 && deltaFromApex < stepAngle) {
    orbitZIndex = 90000;
  } else if (deltaFromBack >= -stepAngle && deltaFromBack < 0) {
    orbitZIndex = deltaFromBack > -0.5 * stepAngle ? 36000 : 38500;
  } else if (deltaFromBack >= 0 && deltaFromBack < stepAngle) {
    orbitZIndex = 37500;
  } else {
    orbitZIndex = Math.round(85000 - Math.abs(deltaFromApex) * 15000) + cardIndex;
  }

  return { tuckX, tuckY, tuckRotY, tuckRotZ, orbitZIndex };
}

/**
 * Calculates the 3D celestial astrolabe pose for a card in the orbital ring.
 */
export function calculateOrbitPose(
  index: number,
  orbitAngle: number,
  timeSec: number,
  config: OrbitConfig
): KinematicTransform {
  const { rx, ry, rz, tiltRad, mergeFactor, shuffleWobbleAmp, isMobile, visibleOrbitCards } =
    config;

  if (index >= visibleOrbitCards) {
    return {
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 0.5,
      opacity: 0,
      zIndex: 0,
      brightness: 1,
      blurPx: 0,
    };
  }

  const theta = (index / visibleOrbitCards) * Math.PI * 2 + orbitAngle;
  const cosTilt = Math.cos(tiltRad);
  const sinTilt = Math.sin(tiltRad);

  const stepAngle = (Math.PI * 2) / visibleOrbitCards;
  const tuck = calculateTuckOffset(
    theta,
    stepAngle,
    mergeFactor,
    isMobile,
    cosTilt,
    sinTilt,
    index
  );

  // Gentle organic ripple wave so the ring moves like a living celestial aurora
  const wobbleR =
    Math.sin(theta * 3 + timeSec * 2.2) * (0.015 + shuffleWobbleAmp) +
    Math.cos(theta * 2 - timeSec * 1.6) * (0.012 + shuffleWobbleAmp * 0.6);
  const wobblyRadius = 1 + wobbleR;

  // 3D vertical and depth ripples
  const waveZ = Math.sin(theta * 2.5 + timeSec * 2.0) * (shuffleWobbleAmp * (isMobile ? 25 : 45));
  const waveY = Math.cos(theta * 3 - timeSec * 1.8) * (shuffleWobbleAmp * (isMobile ? 12 : 20));
  const subtleBreathingY = Math.sin(timeSec * 0.7 + theta * 0.5) * 1.6;

  // Un-tilted ellipse coordinates with full spacious radius preserved
  const lx = Math.cos(theta) * rx * mergeFactor * wobblyRadius;
  const ly = Math.sin(theta) * ry * mergeFactor * (1 - wobbleR * 0.35);

  const targetX = lx * cosTilt - ly * sinTilt - (isMobile ? 10 : 35) * mergeFactor;
  const targetY = lx * sinTilt + ly * cosTilt + waveY + subtleBreathingY;
  const targetZ = Math.sin(theta) * rz * mergeFactor + waveZ;

  const depthNorm = Math.sin(theta);
  const rotWobbleZ = Math.sin(theta * 3 + timeSec * 2.4) * (shuffleWobbleAmp * 22);
  const rotWobbleX = Math.cos(theta * 2 + timeSec * 1.9) * (shuffleWobbleAmp * 12);

  const targetRotY = -Math.cos(theta) * 26 * mergeFactor;
  const targetRotX = (8 - depthNorm * 6) * mergeFactor + rotWobbleX;
  const targetRotZ = (-18 + Math.cos(theta) * 14) * mergeFactor + rotWobbleZ;

  const targetScale = 0.74 + (depthNorm + 1) * 0.22 * mergeFactor;
  const isBack = depthNorm < -0.15;
  const blurPx = isBack ? Math.abs(depthNorm + 0.15) * 1.8 * mergeFactor : 0;
  const brightness = isBack ? 0.65 + (depthNorm + 1) * 0.3 : 1.0;

  return {
    x: targetX,
    y: targetY,
    z: targetZ,
    rotX: targetRotX,
    rotY: targetRotY,
    rotZ: targetRotZ,
    scale: targetScale,
    opacity: 1,
    zIndex: tuck.orbitZIndex,
    brightness,
    blurPx,
    tuckX: tuck.tuckX,
    tuckY: tuck.tuckY,
    tuckRotY: tuck.tuckRotY,
    tuckRotZ: tuck.tuckRotZ,
  };
}

/**
 * Calculates the fanned deck pose for unselected cards in the reading fan.
 */
export function calculateFanPose(config: FanConfig): KinematicTransform {
  const { fanStackIndex, totalUnselected, maxOffset, isMobile, timeSec } = config;
  const normalized = totalUnselected > 1 ? fanStackIndex / (totalUnselected - 1) : 0.5;

  const fanWave = timeSec * 1.3 + fanStackIndex * 0.35;
  const floatY = Math.sin(fanWave) * 3.8;
  const floatZ = Math.cos(fanWave * 0.8) * 6.5;
  const swayRotZ = Math.sin(fanWave * 0.7) * 2.2;
  const tiltRotX = Math.cos(fanWave * 0.6) * 2.5;

  const targetX = (normalized * 2 - 1) * maxOffset;
  const targetY = Math.abs(normalized - 0.5) * (isMobile ? 44 : 64) + floatY + 50;
  const targetZ = (1 - Math.abs(normalized - 0.5) * 2) * 30 + floatZ;
  const targetRotZ = (normalized * 2 - 1) * (isMobile ? 15 : 22) + swayRotZ;
  const targetRotX = tiltRotX;

  return {
    x: targetX,
    y: targetY,
    z: targetZ,
    rotX: targetRotX,
    rotY: 0,
    rotZ: targetRotZ,
    scale: 1,
    opacity: 1,
    zIndex: 10000 + fanStackIndex,
    brightness: 1,
    blurPx: 0,
  };
}
