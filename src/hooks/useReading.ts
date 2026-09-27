import { useState, useCallback, useEffect, useRef } from 'react';
import { PositionedCard, ReadingPosition, ReadingPhase, PersistedReading } from '../types/tarot';
import { DeckEngine } from '../engine/deck';
import { ReadingPersistence } from '../store/persistence';
import { TAROT_DECK } from '../data/cards';

const POSITIONS: ReadingPosition[] = ['past', 'present', 'future'];

export function useReading() {
  const [engine] = useState(() => new DeckEngine());
  const [phase, setPhase] = useState<ReadingPhase>('intro');
  const [selectedCards, setSelectedCards] = useState<PositionedCard[]>([]);
  const isInitialized = useRef(false);

  const saveState = useCallback((currentPhase: ReadingPhase, currentSelection: PositionedCard[]) => {
    if (currentPhase === 'intro' || currentPhase === 'shuffling') return;
    
    const state: PersistedReading = {
      version: 1,
      date: ReadingPersistence.getTodayDateString(),
      phase: currentPhase,
      availableCardIds: engine.getAvailableCards().map(c => c.id),
      drawnCardsData: engine.getDrawnCards().map(d => ({ id: d.card.id, orientation: d.orientation })),
      initialShuffledDeckIds: engine.getInitialDeckOrder().map(c => c.id),
      selectedCardsData: currentSelection.map(c => ({
        id: c.card.id,
        orientation: c.orientation,
        position: c.position,
        isRevealed: c.isRevealed
      }))
    };
    ReadingPersistence.saveReading(state);
  }, [engine]);

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
      
      const restoredSelection = todaysReading.selectedCardsData.map(data => {
        const card = TAROT_DECK.find(c => c.id === data.id)!;
        return {
          card,
          orientation: data.orientation,
          position: data.position,
          isRevealed: data.isRevealed
        };
      });
      
      setSelectedCards(restoredSelection);
      setPhase(todaysReading.phase);
    }
  }, [engine]);

  const beginShuffle = useCallback(() => {
    setPhase('shuffling');
    setTimeout(() => {
      engine.shuffle();
      setPhase('fan');
      saveState('fan', []);
    }, 1500);
  }, [engine, saveState]);

  const selectCardFromFan = useCallback((cardId: string) => {
    if (phase !== 'fan' && phase !== 'place') return;
    if (selectedCards.length >= 3) return;

    try {
      const drawn = engine.selectCardById(cardId);
      const position = POSITIONS[selectedCards.length];
      
      const newCard: PositionedCard = {
        ...drawn,
        position,
        isRevealed: false
      };

      const newSelection = [...selectedCards, newCard];
      setSelectedCards(newSelection);

      const nextPhase = newSelection.length === 3 ? 'place' : 'fan';
      setPhase(nextPhase);
      saveState(nextPhase, newSelection);
    } catch (e) {
      console.error(e);
    }
  }, [engine, selectedCards, phase, saveState]);

  const flipCard = useCallback((cardId: string) => {
    if (phase !== 'place' && phase !== 'read') return;

    setSelectedCards(prev => {
      const card = prev.find(c => c.card.id === cardId);
      if (card?.isRevealed) return prev;

      const updated = prev.map(c => c.card.id === cardId ? { ...c, isRevealed: true } : c);
      
      const nextPhase = (updated.length === 3 && updated.every(c => c.isRevealed)) ? 'read' : 'place';
      setPhase(nextPhase);
      saveState(nextPhase, updated);
      
      return updated;
    });
  }, [phase, saveState]);

  const resetReading = useCallback(() => {
    ReadingPersistence.clearReading();
    window.location.reload(); // The safest way to cleanly unmount and clear the DeckEngine class instance
  }, []);

  return {
    phase,
    selectedCards,
    beginShuffle,
    selectCardFromFan,
    flipCard,
    resetReading,
    availableCards: engine.getAvailableCards(),
    initialDeckOrder: engine.getInitialDeckOrder()
  };
}
