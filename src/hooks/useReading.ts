import { useState, useCallback, useEffect } from 'react';
import { PositionedCard, ReadingPosition } from '../types/tarot';
import { DeckEngine } from '../engine/deck';
import { ReadingPersistence } from '../store/persistence';

export type ReadingPhase = 'intro' | 'shuffling' | 'fan' | 'place' | 'read';

const POSITIONS: ReadingPosition[] = ['past', 'present', 'future'];

export function useReading() {
  const [engine] = useState(() => new DeckEngine());
  const [phase, setPhase] = useState<ReadingPhase>('intro');
  const [selectedCards, setSelectedCards] = useState<PositionedCard[]>([]);

  // Initialize from persistence
  useEffect(() => {
    const todaysReading = ReadingPersistence.getTodaysReading();
    if (todaysReading) {
      setSelectedCards(todaysReading.cards);
      if (todaysReading.cards.every(c => c.isRevealed)) {
        setPhase('read');
      } else {
        setPhase('place');
      }
    }
  }, []);

  const beginShuffle = useCallback(() => {
    setPhase('shuffling');
    // Simulate shuffle animation delay (1.5 seconds)
    setTimeout(() => {
      engine.shuffle();
      setPhase('fan');
    }, 1500);
  }, [engine]);

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

      if (newSelection.length === 3) {
        setPhase('place');
        ReadingPersistence.saveReading({
          date: ReadingPersistence.getTodayDateString(),
          cards: newSelection as [PositionedCard, PositionedCard, PositionedCard]
        });
      } else {
        setPhase('fan');
      }
    } catch (e) {
      console.error(e);
    }
  }, [engine, selectedCards, phase]);

  const flipCard = useCallback((cardId: string) => {
    if (phase !== 'place' && phase !== 'read') return;

    setSelectedCards(prev => {
      // Prevent flipping if already revealed
      const card = prev.find(c => c.card.id === cardId);
      if (card?.isRevealed) return prev;

      const updated = prev.map(c => c.card.id === cardId ? { ...c, isRevealed: true } : c);
      
      if (updated.length === 3) {
        ReadingPersistence.saveReading({
          date: ReadingPersistence.getTodayDateString(),
          cards: updated as [PositionedCard, PositionedCard, PositionedCard]
        });
        
        if (updated.every(c => c.isRevealed)) {
          setPhase('read');
        }
      }
      
      return updated;
    });
  }, [phase]);

  const resetReading = useCallback(() => {
    ReadingPersistence.clearReading();
    setPhase('intro');
    setSelectedCards([]);
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
