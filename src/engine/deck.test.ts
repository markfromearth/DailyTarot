import { describe, it, expect } from 'vitest';
import { DeckEngine } from './deck';

describe('DeckEngine State Restoration', () => {
  it('Should accurately restore shuffled deck, drawn cards, and available cards', () => {
    const engine = new DeckEngine();
    
    // Simulate a state to restore
    const availableCardIds = ['major-0', 'wands-1', 'cups-2'];
    const drawnCardsData = [
      { id: 'major-1', orientation: 'upright' as const },
      { id: 'swords-3', orientation: 'reversed' as const }
    ];
    const initialShuffledDeckIds = ['major-1', 'swords-3', 'major-0', 'wands-1', 'cups-2'];

    engine.restoreState(availableCardIds, drawnCardsData, initialShuffledDeckIds);

    expect(engine.getAvailableCards().map(c => c.id)).toEqual(['major-0', 'wands-1', 'cups-2']);
    
    const drawn = engine.getDrawnCards();
    expect(drawn.length).toBe(2);
    expect(drawn[0].card.id).toBe('major-1');
    expect(drawn[0].orientation).toBe('upright');
    expect(drawn[1].card.id).toBe('swords-3');
    expect(drawn[1].orientation).toBe('reversed');

    expect(engine.getInitialDeckOrder().map(c => c.id)).toEqual(initialShuffledDeckIds);
  });
});
