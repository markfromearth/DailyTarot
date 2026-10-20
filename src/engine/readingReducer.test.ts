import { describe, it, expect } from 'vitest';
import { readingReducer, createInitialReadingState, ReadingState } from './readingReducer';
import { TAROT_DECK } from '../data/cards';
import { PositionedCard } from '../types/tarot';

describe('readingReducer', () => {
  const dummyDeck = TAROT_DECK.slice(0, 10);
  const cardA: PositionedCard = {
    card: dummyDeck[0],
    orientation: 'upright',
    position: 'past',
    isRevealed: false,
  };
  const cardB: PositionedCard = {
    card: dummyDeck[1],
    orientation: 'reversed',
    position: 'present',
    isRevealed: false,
  };
  const cardC: PositionedCard = {
    card: dummyDeck[2],
    orientation: 'upright',
    position: 'future',
    isRevealed: false,
  };

  it('initializes to intro phase with empty selection', () => {
    const state = createInitialReadingState(dummyDeck);
    expect(state.phase).toBe('intro');
    expect(state.selectedCards).toEqual([]);
    expect(state.deckOrder).toEqual(dummyDeck);
    expect(state.error).toBeNull();
  });

  it('transitions from intro to shuffling on START_SHUFFLE', () => {
    const initialState = createInitialReadingState(dummyDeck);
    const state = readingReducer(initialState, { type: 'START_SHUFFLE' });
    expect(state.phase).toBe('shuffling');
  });

  it('transitions from shuffling to fan on FINISH_SHUFFLE', () => {
    const shufflingState: ReadingState = {
      phase: 'shuffling',
      selectedCards: [],
      deckOrder: dummyDeck,
      error: null,
    };
    const shuffledOrder = [...dummyDeck].reverse();
    const state = readingReducer(shufflingState, {
      type: 'FINISH_SHUFFLE',
      payload: { deckOrder: shuffledOrder },
    });
    expect(state.phase).toBe('fan');
    expect(state.deckOrder).toEqual(shuffledOrder);
  });

  it('allows selecting up to 3 cards and transitions to place on 3rd card', () => {
    let state: ReadingState = {
      phase: 'fan',
      selectedCards: [],
      deckOrder: dummyDeck,
      error: null,
    };

    // Select Card 1
    state = readingReducer(state, { type: 'SELECT_CARD', payload: { card: cardA } });
    expect(state.phase).toBe('fan');
    expect(state.selectedCards.length).toBe(1);

    // Select Card 2
    state = readingReducer(state, { type: 'SELECT_CARD', payload: { card: cardB } });
    expect(state.phase).toBe('fan');
    expect(state.selectedCards.length).toBe(2);

    // Select Card 3 -> Transitions to 'place'
    state = readingReducer(state, { type: 'SELECT_CARD', payload: { card: cardC } });
    expect(state.phase).toBe('place');
    expect(state.selectedCards.length).toBe(3);

    // 4th selection is ignored
    const cardExtra: PositionedCard = {
      card: dummyDeck[3],
      orientation: 'upright',
      position: 'future',
      isRevealed: false,
    };
    const stateAfter4th = readingReducer(state, {
      type: 'SELECT_CARD',
      payload: { card: cardExtra },
    });
    expect(stateAfter4th.selectedCards.length).toBe(3);
  });

  it('rejects duplicate card selection and sets error', () => {
    let state: ReadingState = {
      phase: 'fan',
      selectedCards: [cardA],
      deckOrder: dummyDeck,
      error: null,
    };

    state = readingReducer(state, { type: 'SELECT_CARD', payload: { card: cardA } });
    expect(state.selectedCards.length).toBe(1);
    expect(state.error).toContain('already been drawn');
  });

  it('ignores flip attempts during fan phase', () => {
    const fanState: ReadingState = {
      phase: 'fan',
      selectedCards: [cardA],
      deckOrder: dummyDeck,
      error: null,
    };

    const state = readingReducer(fanState, {
      type: 'FLIP_CARD',
      payload: { cardId: cardA.card.id },
    });
    expect(state.selectedCards[0].isRevealed).toBe(false);
  });

  it('reveals cards individually and transitions to read when all 3 are flipped', () => {
    let state: ReadingState = {
      phase: 'place',
      selectedCards: [cardA, cardB, cardC],
      deckOrder: dummyDeck,
      error: null,
    };

    // Flip card A
    state = readingReducer(state, { type: 'FLIP_CARD', payload: { cardId: cardA.card.id } });
    expect(state.selectedCards[0].isRevealed).toBe(true);
    expect(state.phase).toBe('place');

    // Flip card B
    state = readingReducer(state, { type: 'FLIP_CARD', payload: { cardId: cardB.card.id } });
    expect(state.selectedCards[1].isRevealed).toBe(true);
    expect(state.phase).toBe('place');

    // Flip card C -> All revealed -> Transitions to 'read'
    state = readingReducer(state, { type: 'FLIP_CARD', payload: { cardId: cardC.card.id } });
    expect(state.selectedCards[2].isRevealed).toBe(true);
    expect(state.phase).toBe('read');
  });

  it('resets reading to intro with given initial deck order', () => {
    const readingState: ReadingState = {
      phase: 'read',
      selectedCards: [
        { ...cardA, isRevealed: true },
        { ...cardB, isRevealed: true },
        { ...cardC, isRevealed: true },
      ],
      deckOrder: dummyDeck,
      error: 'some error',
    };

    const resetState = readingReducer(readingState, {
      type: 'RESET_READING',
      payload: { initialDeckOrder: dummyDeck },
    });

    expect(resetState.phase).toBe('intro');
    expect(resetState.selectedCards).toEqual([]);
    expect(resetState.error).toBeNull();
  });

  it('handles SET_ERROR and CLEAR_ERROR', () => {
    const state = createInitialReadingState(dummyDeck);
    const withError = readingReducer(state, {
      type: 'SET_ERROR',
      payload: 'Cosmic alignment error',
    });
    expect(withError.error).toBe('Cosmic alignment error');

    const cleared = readingReducer(withError, { type: 'CLEAR_ERROR' });
    expect(cleared.error).toBeNull();
  });
});
