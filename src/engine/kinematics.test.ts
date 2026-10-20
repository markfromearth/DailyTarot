import { describe, it, expect } from 'vitest';
import {
  smoothTuckBell,
  calculateTuckOffset,
  calculateOrbitPose,
  calculateFanPose,
  eulerToQuaternion,
  quaternionToEuler,
  slerpEuler,
  getSquaredDeckPose,
  calculateTransitionPose,
  OrbitConfig,
  FanConfig,
} from './kinematics';

describe('Kinematics Engine', () => {
  describe('smoothTuckBell', () => {
    it('returns 1.0 when delta is exactly at center', () => {
      expect(smoothTuckBell(0, 0, 1)).toBeCloseTo(1.0, 5);
    });

    it('returns 0 when delta is at or outside boundary', () => {
      expect(smoothTuckBell(1, 0, 1)).toBe(0);
      expect(smoothTuckBell(-1, 0, 1)).toBe(0);
      expect(smoothTuckBell(1.5, 0, 1)).toBe(0);
    });

    it('returns continuous symmetric values between 0 and 1', () => {
      const positive = smoothTuckBell(0.5, 0, 1);
      const negative = smoothTuckBell(-0.5, 0, 1);
      expect(positive).toBeGreaterThan(0);
      expect(positive).toBeLessThan(1);
      expect(positive).toBeCloseTo(negative, 5);
    });
  });

  describe('calculateTuckOffset', () => {
    it('returns 0 tuck offsets when card is far from apexes', () => {
      const stepAngle = (Math.PI * 2) / 50;
      const cosTilt = Math.cos(-21 * (Math.PI / 180));
      const sinTilt = Math.sin(-21 * (Math.PI / 180));

      const result = calculateTuckOffset(0, stepAngle, 1.0, false, cosTilt, sinTilt, 0);
      expect(result.tuckX).toBe(0);
      expect(result.tuckY).toBe(0);
      expect(result.tuckRotY).toBe(0);
      expect(result.tuckRotZ).toBe(0);
    });
  });

  describe('calculateOrbitPose', () => {
    const baseConfig: OrbitConfig = {
      rx: 340,
      ry: 172,
      rz: 210,
      tiltRad: -21 * (Math.PI / 180),
      mergeFactor: 1.0,
      shuffleWobbleAmp: 0,
      isMobile: false,
      visibleOrbitCards: 50,
    };

    it('hides cards with index >= visibleOrbitCards', () => {
      const pose = calculateOrbitPose(50, 0, 0, baseConfig);
      expect(pose.opacity).toBe(0);
      expect(pose.scale).toBe(0.5);
    });

    it('computes valid finite numeric poses for visible cards', () => {
      for (let i = 0; i < 50; i += 10) {
        const pose = calculateOrbitPose(i, 0, 0, baseConfig);
        expect(Number.isFinite(pose.x)).toBe(true);
        expect(Number.isFinite(pose.y)).toBe(true);
        expect(Number.isFinite(pose.z)).toBe(true);
        expect(Number.isFinite(pose.scale)).toBe(true);
        expect(pose.opacity).toBe(1);
        expect(pose.zIndex).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateFanPose', () => {
    it('computes symmetric coordinates around the center card', () => {
      const configLeft: FanConfig = {
        fanStackIndex: 0,
        totalUnselected: 11,
        maxOffset: 350,
        cardWidth: 128,
        isMobile: false,
        timeSec: 0,
      };
      const configRight: FanConfig = {
        fanStackIndex: 10,
        totalUnselected: 11,
        maxOffset: 350,
        cardWidth: 128,
        isMobile: false,
        timeSec: 0,
      };

      const poseLeft = calculateFanPose(configLeft);
      const poseRight = calculateFanPose(configRight);

      expect(poseLeft.x).toBeCloseTo(-poseRight.x, 1);
      expect(poseLeft.x).toBeLessThan(0);
      expect(poseRight.x).toBeGreaterThan(0);
      expect(poseLeft.rotZ).toBeLessThan(0);
      expect(poseRight.rotZ).toBeGreaterThan(0);
    });
  });

  describe('Quaternion and SLERP 3D Rotations', () => {
    it('converts Euler to Quaternion and back with numerical precision', () => {
      const angles = [
        { rotX: 0, rotY: 0, rotZ: 0 },
        { rotX: 14, rotY: -26, rotZ: -18 },
        { rotX: -8, rotY: 15, rotZ: 22 },
      ];

      angles.forEach(({ rotX, rotY, rotZ }) => {
        const q = eulerToQuaternion(rotX, rotY, rotZ);
        const res = quaternionToEuler(q);
        expect(res.rotX).toBeCloseTo(rotX, 3);
        expect(res.rotY).toBeCloseTo(rotY, 3);
        expect(res.rotZ).toBeCloseTo(rotZ, 3);
      });
    });

    it('slerpEuler smoothly interpolates rotations without gimbal anomalies', () => {
      const start = { rotX: 16, rotY: -24, rotZ: -14 };
      const end = { rotX: 0, rotY: 0, rotZ: 0 };

      const atZero = slerpEuler(start, end, 0);
      expect(atZero.rotX).toBeCloseTo(start.rotX, 4);
      expect(atZero.rotY).toBeCloseTo(start.rotY, 4);
      expect(atZero.rotZ).toBeCloseTo(start.rotZ, 4);

      const atMid = slerpEuler(start, end, 0.5);
      expect(atMid.rotX).toBeGreaterThan(end.rotX);
      expect(atMid.rotX).toBeLessThan(start.rotX);
      expect(atMid.rotY).toBeLessThan(end.rotY);
      expect(atMid.rotY).toBeGreaterThan(start.rotY);

      const atOne = slerpEuler(start, end, 1);
      expect(atOne.rotX).toBeCloseTo(end.rotX, 4);
      expect(atOne.rotY).toBeCloseTo(end.rotY, 4);
      expect(atOne.rotZ).toBeCloseTo(end.rotZ, 4);
    });
  });

  describe('calculateTransitionPose (Gathering & Bloom Choreography)', () => {
    const orbitConfig: OrbitConfig = {
      rx: 340,
      ry: 172,
      rz: 210,
      tiltRad: -21 * (Math.PI / 180),
      mergeFactor: 1.08,
      shuffleWobbleAmp: 0,
      isMobile: false,
      visibleOrbitCards: 50,
    };

    const fanConfig: FanConfig = {
      fanStackIndex: 0,
      totalUnselected: 78,
      maxOffset: 350,
      cardWidth: 128,
      isMobile: false,
      timeSec: 0,
    };

    it('returns exact orbit pose at start of transition (elapsed = 0)', () => {
      const orbitPose = calculateOrbitPose(0, 0, 0, orbitConfig);
      const fanPose = calculateFanPose(fanConfig);

      const pose = calculateTransitionPose({
        cardIndex: 0,
        totalCards: 78,
        fanStackIndex: 0,
        totalUnselected: 78,
        elapsedMs: 0,
        durationMs: 2600,
        orbitPose,
        fanPose,
        isMobile: false,
      });

      expect(pose.x).toBeCloseTo(orbitPose.x, 3);
      expect(pose.y).toBeCloseTo(orbitPose.y, 3);
      expect(pose.z).toBeCloseTo(orbitPose.z, 3);
      expect(pose.rotX).toBeCloseTo(orbitPose.rotX, 3);
      expect(pose.rotY).toBeCloseTo(orbitPose.rotY, 3);
      expect(pose.rotZ).toBeCloseTo(orbitPose.rotZ, 3);
    });

    it('gathers cards into squared deck position at center bottom during settle phase', () => {
      const orbitPose = calculateOrbitPose(0, 0, 0, orbitConfig);
      const fanPose = calculateFanPose(fanConfig);
      const deckPose = getSquaredDeckPose(0, false);

      // At 47% elapsed (settle phase):
      const pose = calculateTransitionPose({
        cardIndex: 0,
        totalCards: 78,
        fanStackIndex: 0,
        totalUnselected: 78,
        elapsedMs: 2600 * 0.47,
        durationMs: 2600,
        orbitPose,
        fanPose,
        isMobile: false,
      });

      expect(pose.x).toBeCloseTo(deckPose.x, 2);
      expect(pose.y).toBeCloseTo(deckPose.y, 2);
      expect(pose.rotX).toBeCloseTo(0, 2);
      expect(pose.rotY).toBeCloseTo(0, 2);
      expect(pose.rotZ).toBeCloseTo(0, 2);
    });

    it('returns exact fan pose at completion (elapsed >= duration)', () => {
      const orbitPose = calculateOrbitPose(0, 0, 0, orbitConfig);
      const fanPose = calculateFanPose(fanConfig);

      const pose = calculateTransitionPose({
        cardIndex: 0,
        totalCards: 78,
        fanStackIndex: 0,
        totalUnselected: 78,
        elapsedMs: 2600,
        durationMs: 2600,
        orbitPose,
        fanPose,
        isMobile: false,
      });

      expect(pose.x).toBeCloseTo(fanPose.x, 3);
      expect(pose.y).toBeCloseTo(fanPose.y, 3);
      expect(pose.rotX).toBeCloseTo(fanPose.rotX, 3);
      expect(pose.rotZ).toBeCloseTo(fanPose.rotZ, 3);
      expect(pose.opacity).toBe(1);
    });

    it('introduces index-based staggering during gather and bloom', () => {
      const orbitPose0 = calculateOrbitPose(0, 0, 0, orbitConfig);
      const orbitPose70 = calculateOrbitPose(70, 0, 0, orbitConfig);
      const fanPose0 = calculateFanPose({ ...fanConfig, fanStackIndex: 0 });
      const fanPose70 = calculateFanPose({ ...fanConfig, fanStackIndex: 70 });

      // At 20% elapsed, card 0 has advanced further in gathering than card 70
      const pose0 = calculateTransitionPose({
        cardIndex: 0,
        totalCards: 78,
        fanStackIndex: 0,
        totalUnselected: 78,
        elapsedMs: 2600 * 0.2,
        durationMs: 2600,
        orbitPose: orbitPose0,
        fanPose: fanPose0,
        isMobile: false,
      });

      const pose70 = calculateTransitionPose({
        cardIndex: 70,
        totalCards: 78,
        fanStackIndex: 70,
        totalUnselected: 78,
        elapsedMs: 2600 * 0.2,
        durationMs: 2600,
        orbitPose: orbitPose70,
        fanPose: fanPose70,
        isMobile: false,
      });

      expect(pose0.x).not.toBe(pose70.x);
      expect(pose0.y).not.toBe(pose70.y);
    });
  });
});
