import { describe, it, expect, beforeEach } from 'vitest';
import { DeckEngine } from './deck';
import { TAROT_DECK } from '../data/cards';

describe('Tarot Deck Engine', () => {
  let engine: DeckEngine;

  beforeEach(() => {
    engine = new DeckEngine();
  });

  describe('Deck Data', () => {
    it('should have exactly 78 cards', () => {
      expect(TAROT_DECK.length).toBe(78);
    });

    it('should have entirely unique IDs', () => {
      const ids = TAROT_DECK.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(TAROT_DECK.length);
    });

    it('should contain all 22 Major Arcana cards', () => {
      const majorCards = TAROT_DECK.filter(card => card.arcana === 'major');
      expect(majorCards.length).toBe(22);
      expect(majorCards.every(card => card.suit === null)).toBe(true);
    });

    it('should contain all four Minor Arcana suits (14 cards each)', () => {
      const wands = TAROT_DECK.filter(card => card.suit === 'wands');
      const cups = TAROT_DECK.filter(card => card.suit === 'cups');
      const swords = TAROT_DECK.filter(card => card.suit === 'swords');
      const pentacles = TAROT_DECK.filter(card => card.suit === 'pentacles');

      expect(wands.length).toBe(14);
      expect(cups.length).toBe(14);
      expect(swords.length).toBe(14);
      expect(pentacles.length).toBe(14);
    });
  });

  describe('Shuffle', () => {
    it('should change the deck order', () => {
      const originalOrder = engine.getAvailableCards().map(c => c.id);
      
      // Shuffle until order changes (almost always on first try, but theoretically could match)
      let shuffles = 0;
      let newOrder;
      do {
        engine.shuffle();
        newOrder = engine.getAvailableCards().map(c => c.id);
        shuffles++;
      } while (originalOrder.join(',') === newOrder.join(',') && shuffles < 5);

      expect(newOrder.join(',')).not.toBe(originalOrder.join(','));
    });
  });

  describe('Drawing and Selection', () => {
    it('should remove drawn cards from the available deck', () => {
      const initialCount = engine.getAvailableCards().length;
      engine.draw(3);
      const newCount = engine.getAvailableCards().length;
      expect(newCount).toBe(initialCount - 3);
    });

    it('should prevent drawing duplicate cards', () => {
      const cardId = engine.getAvailableCards()[0].id;
      
      // Select it once
      engine.selectCardById(cardId);
      
      // Selecting the same card again should throw
      expect(() => {
        engine.selectCardById(cardId);
      }).toThrow(/already been drawn|not found/);
    });

    it('should produce three distinct cards on three consecutive draws', () => {
      const drawnCards = engine.draw(3);
      expect(drawnCards.length).toBe(3);
      
      const ids = drawnCards.map(d => d.card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should preserve orientation persistently once drawn', () => {
      const cardToDraw = engine.getAvailableCards()[0].id;
      const drawn = engine.selectCardById(cardToDraw);
      
      const initialOrientation = drawn.orientation;
      
      // Retrieve the drawn cards later
      const allDrawn = engine.getDrawnCards();
      const retrieved = allDrawn.find(d => d.card.id === cardToDraw);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.orientation).toBe(initialOrientation);
      
      // Orientation shouldn't change on consecutive gets
      const allDrawnAgain = engine.getDrawnCards();
      const retrievedAgain = allDrawnAgain.find(d => d.card.id === cardToDraw);
      expect(retrievedAgain?.orientation).toBe(initialOrientation);
    });
  });
});
