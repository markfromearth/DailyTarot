export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles' | null;

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  number?: number;
  uprightMeaning: string;
  reversedMeaning: string;
  imageUrl?: string;
}

export type Orientation = 'upright' | 'reversed';

export interface DrawnCard {
  card: TarotCard;
  orientation: Orientation;
}

export type ReadingPosition = 'past' | 'present' | 'future';

export interface PositionedCard extends DrawnCard {
  position: ReadingPosition;
  isRevealed: boolean;
}

export interface Reading {
  date: string; // YYYY-MM-DD
  cards: [PositionedCard, PositionedCard, PositionedCard];
}
