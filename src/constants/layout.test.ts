import { describe, it, expect } from 'vitest';
import { getSpreadLayout, getSlotCoordinate } from './layout';

describe('Layout Constants', () => {
  it('computes desktop spread layout dimensions accurately', () => {
    const layout = getSpreadLayout(false);
    expect(layout.cardWidth).toBe(128);
    expect(layout.spacing).toBe(38);
    expect(layout.totalWidth).toBe(128 * 3 + 38 * 2);
    expect(layout.yOffset).toBe(-170);
  });

  it('computes mobile spread layout dimensions accurately', () => {
    const layout = getSpreadLayout(true);
    expect(layout.cardWidth).toBe(96);
    expect(layout.spacing).toBe(14);
    expect(layout.totalWidth).toBe(96 * 3 + 14 * 2);
    expect(layout.yOffset).toBe(-145);
  });

  it('calculates symmetrical slot coordinates for 3 cards', () => {
    const slot0 = getSlotCoordinate(0, false);
    const slot1 = getSlotCoordinate(1, false);
    const slot2 = getSlotCoordinate(2, false);

    expect(slot1.x).toBeCloseTo(0, 5); // Center card at x=0
    expect(slot0.x).toBeCloseTo(-slot2.x, 5); // Left card symmetric to right card
    expect(slot0.y).toBe(slot1.y);
    expect(slot1.y).toBe(slot2.y);
  });
});
