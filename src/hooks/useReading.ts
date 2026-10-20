import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { PositionedCard, ReadingPosition, ReadingPhase, PersistedReading } from '../types/tarot';
import { DeckEngine } from '../engine/deck';
import { ReadingPersistence } from '../store/persistence';
import { TAROT_DECK } from '../data/cards';
import { readingReducer, createInitialReadingState } from '../engine/readingReducer';

const POSITIONS: ReadingPosition[] = ['past', 'present', 'future'];

export const SHUFFLE_DURATION_MS = 5000;

export function useReading() {
  const [engine] = useState(() => new DeckEngine());
  const [state, dispatch] = useReducer(readingReducer, undefined, () =>
    createInitialReadingState(engine.getInitialDeckOrder())
  );
  const isInitialized = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const saveState = useCallback(
    (currentPhase: ReadingPhase, currentSelection: PositionedCard[]) => {
      if (currentPhase === 'intro' || currentPhase === 'shuffling') return;

      const persisted: PersistedReading = {
        version: 1,
        date: ReadingPersistence.getTodayDateString(),
        phase: currentPhase,
        availableCardIds: engine.getAvailableCards().map((c) => c.id),
        drawnCardsData: engine
          .getDrawnCards()
          .map((d) => ({ id: d.card.id, orientation: d.orientation })),
        initialShuffledDeckIds: engine.getInitialDeckOrder().map((c) => c.id),
        selectedCardsData: currentSelection.map((c) => ({
          id: c.card.id,
          orientation: c.orientation,
          position: c.position,
          isRevealed: c.isRevealed,
        })),
      };
      ReadingPersistence.saveReading(persisted);
    },
    [engine]
  );

  // Initialize from persistence
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const todaysReading = ReadingPersistence.getTodaysReading();
    if (todaysReading) {
      engine.restoreState(
        todaysReading.availableCardIds,
        todaysReading.drawnCardsData,
        todaysReading.initialShuffledDeckIds
      );

      const restoredSelection = todaysReading.selectedCardsData.map((data) => {
        const card = TAROT_DECK.find((c) => c.id === data.id)!;
        return {
          card,
          orientation: data.orientation,
          position: data.position,
          isRevealed: data.isRevealed,
        };
      });

      dispatch({
        type: 'RESTORE_READING',
        payload: {
          phase: todaysReading.phase,
          selectedCards: restoredSelection,
          deckOrder: engine.getInitialDeckOrder(),
        },
      });
    }
  }, [engine]);

  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) {
        clearTimeout(shuffleTimerRef.current);
      }
    };
  }, []);

  const beginShuffle = useCallback(() => {
    dispatch({ type: 'START_SHUFFLE' });
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current);
    }
    shuffleTimerRef.current = setTimeout(() => {
      engine.shuffle();
      const newDeckOrder = engine.getInitialDeckOrder();
      dispatch({
        type: 'FINISH_SHUFFLE',
        payload: { deckOrder: newDeckOrder },
      });
      saveState('fan', stateRef.current.selectedCards);
    }, SHUFFLE_DURATION_MS);
  }, [engine, saveState]);

  const selectCardFromFan = useCallback(
    (cardId: string) => {
      const currentPhase = stateRef.current.phase;
      const currentSelected = stateRef.current.selectedCards;

      if (currentPhase !== 'fan' && currentPhase !== 'place') return;
      if (currentSelected.length >= 3) return;

      try {
        const drawn = engine.selectCardById(cardId);
        const position = POSITIONS[currentSelected.length];

        const newCard: PositionedCard = {
          ...drawn,
          position,
          isRevealed: false,
        };

        dispatch({ type: 'SELECT_CARD', payload: { card: newCard } });

        const newSelection = [...currentSelected, newCard];
        const nextPhase = newSelection.length === 3 ? 'place' : 'fan';
        saveState(nextPhase, newSelection);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error selecting card';
        dispatch({ type: 'SET_ERROR', payload: message });
      }
    },
    [engine, saveState]
  );

  const flipCard = useCallback(
    (cardId: string) => {
      const currentPhase = stateRef.current.phase;
      const currentSelected = stateRef.current.selectedCards;

      if (currentPhase !== 'place' && currentPhase !== 'read') return;

      const card = currentSelected.find((c) => c.card.id === cardId);
      if (!card || card.isRevealed) return;

      dispatch({ type: 'FLIP_CARD', payload: { cardId } });

      const updated = currentSelected.map((c) =>
        c.card.id === cardId ? { ...c, isRevealed: true } : c
      );
      const nextPhase =
        updated.length === 3 && updated.every((c) => c.isRevealed) ? 'read' : 'place';
      saveState(nextPhase, updated);
    },
    [saveState]
  );

  const resetReading = useCallback(() => {
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current);
    }
    ReadingPersistence.clearReading();
    engine.reset();
    dispatch({
      type: 'RESET_READING',
      payload: { initialDeckOrder: engine.getInitialDeckOrder() },
    });
  }, [engine]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return {
    phase: state.phase,
    selectedCards: state.selectedCards,
    error: state.error,
    clearError,
    beginShuffle,
    selectCardFromFan,
    flipCard,
    resetReading,
    availableCards: engine.getAvailableCards(),
    initialDeckOrder: state.deckOrder,
  };
}
