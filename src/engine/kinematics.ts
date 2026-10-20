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

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface TransitionChoreographyConfig {
  cardIndex: number;
  totalCards: number;
  fanStackIndex: number;
  totalUnselected: number;
  elapsedMs: number;
  durationMs: number;
  orbitPose: KinematicTransform;
  fanPose: KinematicTransform;
  isMobile: boolean;
}

/**
 * Converts Euler angles in degrees (order X-Y-Z) to a normalized quaternion.
 */
export function eulerToQuaternion(rotXDeg: number, rotYDeg: number, rotZDeg: number): Quaternion {
  const DEG2RAD = Math.PI / 180;
  const x = rotXDeg * DEG2RAD * 0.5;
  const y = rotYDeg * DEG2RAD * 0.5;
  const z = rotZDeg * DEG2RAD * 0.5;

  const c1 = Math.cos(x),
    c2 = Math.cos(y),
    c3 = Math.cos(z);
  const s1 = Math.sin(x),
    s2 = Math.sin(y),
    s3 = Math.sin(z);

  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 + s1 * s2 * c3,
    w: c1 * c2 * c3 - s1 * s2 * s3,
  };
}

/**
 * Converts a quaternion to Euler angles in degrees (order X-Y-Z).
 */
export function quaternionToEuler(q: Quaternion): { rotX: number; rotY: number; rotZ: number } {
  const RAD2DEG = 180 / Math.PI;
  const { x, y, z, w } = q;

  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y - z * w);
  const m13 = 2 * (x * z + y * w);
  const m23 = 2 * (y * z - x * w);
  const m32 = 2 * (y * z + x * w);
  const m33 = 1 - 2 * (x * x + y * y);
  const m22 = 1 - 2 * (x * x + z * z);

  const clampedM13 = Math.max(-1, Math.min(1, m13));
  const rotY = Math.asin(clampedM13);
  let rotX: number;
  let rotZ: number;

  if (Math.abs(clampedM13) < 0.9999999) {
    rotX = Math.atan2(-m23, m33);
    rotZ = Math.atan2(-m12, m11);
  } else {
    rotX = Math.atan2(m32, m22);
    rotZ = 0;
  }

  return {
    rotX: rotX * RAD2DEG,
    rotY: rotY * RAD2DEG,
    rotZ: rotZ * RAD2DEG,
  };
}

/**
 * Spherical linear interpolation between two quaternions along the geodesic on S^3.
 */
export function slerpQuaternion(q1: Quaternion, q2: Quaternion, t: number): Quaternion {
  let { x: x2, y: y2, z: z2, w: w2 } = q2;
  let dot = q1.x * x2 + q1.y * y2 + q1.z * z2 + q1.w * w2;

  if (dot < 0) {
    dot = -dot;
    x2 = -x2;
    y2 = -y2;
    z2 = -z2;
    w2 = -w2;
  }

  if (dot > 0.9995) {
    const x = q1.x + t * (x2 - q1.x);
    const y = q1.y + t * (y2 - q1.y);
    const z = q1.z + t * (z2 - q1.z);
    const w = q1.w + t * (w2 - q1.w);
    const len = Math.hypot(x, y, z, w) || 1;
    return { x: x / len, y: y / len, z: z / len, w: w / len };
  }

  const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
  const theta = theta0 * t;
  const sinTheta0 = Math.sin(theta0);
  const sinTheta = Math.sin(theta);

  const s0 = Math.cos(theta) - (dot * sinTheta) / sinTheta0;
  const s1 = sinTheta / sinTheta0;

  return {
    x: s0 * q1.x + s1 * x2,
    y: s0 * q1.y + s1 * y2,
    z: s0 * q1.z + s1 * z2,
    w: s0 * q1.w + s1 * w2,
  };
}

/**
 * Interpolates Euler angles in degrees using quaternion SLERP for smooth, gimbal-free 3D rotation.
 */
export function slerpEuler(
  rot1: { rotX: number; rotY: number; rotZ: number },
  rot2: { rotX: number; rotY: number; rotZ: number },
  t: number
): { rotX: number; rotY: number; rotZ: number } {
  if (t <= 0) return { ...rot1 };
  if (t >= 1) return { ...rot2 };

  const q1 = eulerToQuaternion(rot1.rotX, rot1.rotY, rot1.rotZ);
  const q2 = eulerToQuaternion(rot2.rotX, rot2.rotY, rot2.rotZ);
  const qInterp = slerpQuaternion(q1, q2, t);
  return quaternionToEuler(qInterp);
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

/**
 * Returns the squared-up deck pose resting at bottom center (representing dealer's gathered deck).
 */
export function getSquaredDeckPose(cardIndex: number, isMobile: boolean): KinematicTransform {
  return {
    x: 0,
    y: isMobile ? 66 : 80,
    z: -cardIndex * 0.22,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 1,
    opacity: 1,
    zIndex: 10000 + cardIndex,
    brightness: 1,
    blurPx: 0,
    tuckX: 0,
    tuckY: 0,
    tuckRotY: 0,
    tuckRotZ: 0,
  };
}

/**
 * Choreographs the smooth physical transition between the orbital ring and the fanned reading deck:
 * Act 1 (0% -> 42%): Gathering Phase - The ring dynamically spirals and collapses inwards into a squared deck.
 * Act 2 (42% -> 52%): Settle Phase - The squared deck pauses momentarily in the dealer's hand.
 * Act 3 (52% -> 100%): Ribbon Bloom Phase - The cards unfurl smoothly from the deck into the reading fan.
 */
export function calculateTransitionPose(config: TransitionChoreographyConfig): KinematicTransform {
  const {
    cardIndex,
    totalCards,
    fanStackIndex,
    totalUnselected,
    elapsedMs,
    durationMs,
    orbitPose,
    fanPose,
    isMobile,
  } = config;

  if (elapsedMs <= 0) {
    return { ...orbitPose };
  }
  if (elapsedMs >= durationMs) {
    return { ...fanPose };
  }

  const normT = Math.min(1, Math.max(0, elapsedMs / durationMs));
  const deckPose = getSquaredDeckPose(cardIndex, isMobile);

  // Phase 1: Inward Spiral Collapse into squared deck (0.00 -> 0.42)
  if (normT < 0.42) {
    // Index-based organic stagger: cards pull inward in a living cascading wave
    const gatherStagger = (cardIndex / Math.max(1, totalCards - 1)) * 0.12;
    const cardProgress = Math.min(1, Math.max(0, (normT - gatherStagger) / (0.42 - gatherStagger)));
    const easeGather = 0.5 - 0.5 * Math.cos(cardProgress * Math.PI);

    // Dynamic spiral arc: subtle lateral vortex sweep as cards collapse inward
    const spiralArc = Math.sin(easeGather * Math.PI) * (isMobile ? 18 : 28);
    // Vertical scoop: cards gently lift then settle down into the deck
    const liftY = -Math.sin(easeGather * Math.PI) * (isMobile ? 14 : 22);

    const x =
      orbitPose.x +
      (deckPose.x - orbitPose.x) * easeGather +
      Math.cos(cardIndex * 0.3) * spiralArc * (1 - easeGather);
    const y = orbitPose.y + (deckPose.y - orbitPose.y) * easeGather + liftY;
    const z = orbitPose.z + (deckPose.z - orbitPose.z) * easeGather;

    const rot = slerpEuler(
      { rotX: orbitPose.rotX, rotY: orbitPose.rotY, rotZ: orbitPose.rotZ },
      { rotX: deckPose.rotX, rotY: deckPose.rotY, rotZ: deckPose.rotZ },
      easeGather
    );

    const scale = orbitPose.scale + (deckPose.scale - orbitPose.scale) * easeGather;

    // Smoothly fade in cards that were invisible in the 50-card ring
    const baseOpacity = cardIndex < 50 ? 1 : 0;
    const opacity = baseOpacity + (1 - baseOpacity) * Math.min(1, easeGather * 1.6);

    const blurPx = orbitPose.blurPx * (1 - easeGather);
    const brightness = orbitPose.brightness + (1 - orbitPose.brightness) * easeGather;

    // Tuck offsets fade out smoothly
    const tuckX = (orbitPose.tuckX ?? 0) * (1 - easeGather);
    const tuckY = (orbitPose.tuckY ?? 0) * (1 - easeGather);
    const tuckRotY = (orbitPose.tuckRotY ?? 0) * (1 - easeGather);
    const tuckRotZ = (orbitPose.tuckRotZ ?? 0) * (1 - easeGather);

    return {
      x,
      y,
      z,
      rotX: rot.rotX,
      rotY: rot.rotY,
      rotZ: rot.rotZ,
      scale,
      opacity,
      zIndex: easeGather > 0.5 ? deckPose.zIndex : orbitPose.zIndex,
      brightness,
      blurPx,
      tuckX,
      tuckY,
      tuckRotY,
      tuckRotZ,
    };
  }

  // Phase 2: Settled squared deck (0.42 -> 0.52)
  if (normT < 0.52) {
    return { ...deckPose };
  }

  // Phase 3: Ribbon Fan Bloom Phase (0.52 -> 1.00)
  // Dealer ribbon spread ripples out across the table
  const fanStagger = (fanStackIndex / Math.max(1, totalUnselected - 1)) * 0.16;
  const bloomProgress = Math.min(1, Math.max(0, (normT - 0.52 - fanStagger) / (0.48 - fanStagger)));
  const easeBloom = 0.5 - 0.5 * Math.cos(bloomProgress * Math.PI);

  // Gentle wave crest as cards spread outward
  const crestY = -Math.sin(easeBloom * Math.PI) * (isMobile ? 10 : 16);

  const x = deckPose.x + (fanPose.x - deckPose.x) * easeBloom;
  const y = deckPose.y + (fanPose.y - deckPose.y) * easeBloom + crestY;
  const z = deckPose.z + (fanPose.z - deckPose.z) * easeBloom;

  const rot = slerpEuler(
    { rotX: deckPose.rotX, rotY: deckPose.rotY, rotZ: deckPose.rotZ },
    { rotX: fanPose.rotX, rotY: fanPose.rotY, rotZ: fanPose.rotZ },
    easeBloom
  );

  const scale = deckPose.scale + (fanPose.scale - deckPose.scale) * easeBloom;

  return {
    x,
    y,
    z,
    rotX: rot.rotX,
    rotY: rot.rotY,
    rotZ: rot.rotZ,
    scale,
    opacity: 1,
    zIndex: fanPose.zIndex,
    brightness: 1,
    blurPx: 0,
    tuckX: 0,
    tuckY: 0,
    tuckRotY: 0,
    tuckRotZ: 0,
  };
}
