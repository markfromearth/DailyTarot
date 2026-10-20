import { describe, it, expect } from 'vitest';
import {
  smoothTuckBell,
  calculateTuckOffset,
  calculateOrbitPose,
  calculateFanPose,
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
});
