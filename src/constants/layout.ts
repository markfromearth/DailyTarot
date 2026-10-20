/**
 * Canonical layout dimensions and geometric constants for DailyTarot.
 * Serves as the single source of truth for both ReadingSlots and DeckExperience.
 */

export interface SpreadLayout {
  cardWidth: number;
  spacing: number;
  totalWidth: number;
  startX: number;
  yOffset: number;
}

export function getSpreadLayout(isMobile: boolean): SpreadLayout {
  const cardWidth = isMobile ? 96 : 128;
  const spacing = isMobile ? 14 : 38;
  const totalWidth = cardWidth * 3 + spacing * 2;
  const startX = -(totalWidth / 2) + cardWidth / 2;
  const yOffset = isMobile ? -145 : -170;

  return {
    cardWidth,
    spacing,
    totalWidth,
    startX,
    yOffset,
  };
}

export function getSlotCoordinate(slotIndex: number, isMobile: boolean): { x: number; y: number } {
  const layout = getSpreadLayout(isMobile);
  return {
    x: layout.startX + slotIndex * (layout.cardWidth + layout.spacing),
    y: layout.yOffset,
  };
}
