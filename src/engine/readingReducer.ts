import { PositionedCard, ReadingPhase, TarotCard } from '../types/tarot';

export interface ReadingState {
  phase: ReadingPhase;
  selectedCards: PositionedCard[];
  deckOrder: TarotCard[];
  error: string | null;
}

export type ReadingAction =
  | { type: 'START_SHUFFLE' }
  | { type: 'FINISH_SHUFFLE'; payload: { deckOrder: TarotCard[] } }
  | { type: 'SELECT_CARD'; payload: { card: PositionedCard } }
  | { type: 'FLIP_CARD'; payload: { cardId: string } }
  | {
      type: 'RESTORE_READING';
      payload: {
        phase: ReadingPhase;
        selectedCards: PositionedCard[];
        deckOrder: TarotCard[];
      };
    }
  | { type: 'RESET_READING'; payload: { initialDeckOrder: TarotCard[] } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export function createInitialReadingState(initialDeckOrder: TarotCard[]): ReadingState {
  return {
    phase: 'intro',
    selectedCards: [],
    deckOrder: initialDeckOrder,
    error: null,
  };
}

export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case 'START_SHUFFLE':
      return {
        ...state,
        phase: 'shuffling',
        error: null,
      };

    case 'FINISH_SHUFFLE':
      return {
        ...state,
        phase: 'fan',
        deckOrder: action.payload.deckOrder,
        error: null,
      };

    case 'SELECT_CARD': {
      if (state.phase !== 'fan' && state.phase !== 'place') {
        return state;
      }

      if (state.selectedCards.length >= 3) {
        return state;
      }

      const isAlreadyDrawn = state.selectedCards.some(
        (c) => c.card.id === action.payload.card.card.id
      );
      if (isAlreadyDrawn) {
        return {
          ...state,
          error: `Card ${action.payload.card.card.name} has already been drawn.`,
        };
      }

      const updatedSelection = [...state.selectedCards, action.payload.card];
      const nextPhase: ReadingPhase = updatedSelection.length === 3 ? 'place' : 'fan';

      return {
        ...state,
        phase: nextPhase,
        selectedCards: updatedSelection,
        error: null,
      };
    }

    case 'FLIP_CARD': {
      if (state.phase !== 'place' && state.phase !== 'read') {
        return state;
      }

      const targetCard = state.selectedCards.find((c) => c.card.id === action.payload.cardId);
      if (!targetCard || targetCard.isRevealed) {
        return state;
      }

      const updatedCards = state.selectedCards.map((c) =>
        c.card.id === action.payload.cardId ? { ...c, isRevealed: true } : c
      );

      const allRevealed = updatedCards.length === 3 && updatedCards.every((c) => c.isRevealed);
      const nextPhase: ReadingPhase = allRevealed ? 'read' : 'place';

      return {
        ...state,
        phase: nextPhase,
        selectedCards: updatedCards,
        error: null,
      };
    }

    case 'RESTORE_READING':
      return {
        ...state,
        phase: action.payload.phase,
        selectedCards: action.payload.selectedCards,
        deckOrder: action.payload.deckOrder,
        error: null,
      };

    case 'RESET_READING':
      return {
        ...state,
        phase: 'intro',
        selectedCards: [],
        deckOrder: action.payload.initialDeckOrder,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
