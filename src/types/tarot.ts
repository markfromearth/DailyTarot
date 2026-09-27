export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles' | null;
export type Rank = 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'page' | 'knight' | 'queen' | 'king' | null;

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  rank?: Rank;
  number?: number;
  uprightMeaning: string;
  reversedMeaning: string;
  imageUrl?: string;
  imageAltText?: string;
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

export type ReadingPhase = 'intro' | 'shuffling' | 'fan' | 'place' | 'read';

export interface PersistedReading {
  version: 1;
  date: string;
  phase: ReadingPhase;
  availableCardIds: string[];
  drawnCardsData: { id: string; orientation: Orientation }[];
  initialShuffledDeckIds: string[];
  selectedCardsData: { 
    id: string; 
    orientation: Orientation; 
    position: ReadingPosition; 
    isRevealed: boolean;
  }[];
}
