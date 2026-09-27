import { describe, it, expect } from 'vitest';
import { TAROT_DECK } from './cards';
import { Arcana, Suit, Rank } from '../types/tarot';

describe('Tarot Deck Data Validation', () => {
  it('should contain exactly 78 cards', () => {
    expect(TAROT_DECK.length).toBe(78);
  });

  it('should have exactly 22 Major Arcana cards', () => {
    const majors = TAROT_DECK.filter(c => c.arcana === 'major');
    expect(majors.length).toBe(22);
  });

  it('should have exactly 56 Minor Arcana cards', () => {
    const minors = TAROT_DECK.filter(c => c.arcana === 'minor');
    expect(minors.length).toBe(56);
  });

  it('should have no duplicate IDs', () => {
    const ids = TAROT_DECK.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every card should have a valid structure', () => {
    const validArcanas: Arcana[] = ['major', 'minor'];
    const validSuits: Suit[] = ['wands', 'cups', 'swords', 'pentacles', null];
    const validRanks: Rank[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king', null];

    TAROT_DECK.forEach(card => {
      // Basic fields
      expect(card.id).toBeTruthy();
      expect(typeof card.id).toBe('string');
      expect(card.name).toBeTruthy();
      expect(typeof card.name).toBe('string');
      
      // Arcana, Suit, Rank
      expect(validArcanas).toContain(card.arcana);
      expect(validSuits).toContain(card.suit);
      expect(validRanks).toContain(card.rank);

      // Meanings
      expect(card.uprightMeaning).toBeTruthy();
      expect(typeof card.uprightMeaning).toBe('string');
      expect(card.uprightMeaning.length).toBeGreaterThan(10);
      
      expect(card.reversedMeaning).toBeTruthy();
      expect(typeof card.reversedMeaning).toBe('string');
      expect(card.reversedMeaning.length).toBeGreaterThan(10);
      
      // Major specific logic
      if (card.arcana === 'major') {
        expect(card.suit).toBeNull();
        expect(card.rank).toBeNull();
        expect(typeof card.number).toBe('number');
        expect(card.number).toBeGreaterThanOrEqual(0);
        expect(card.number).toBeLessThanOrEqual(21);
      }
      
      // Minor specific logic
      if (card.arcana === 'minor') {
        expect(card.suit).not.toBeNull();
        expect(card.rank).not.toBeNull();
        expect(typeof card.number).toBe('number');
        expect(card.number).toBeGreaterThanOrEqual(1);
        expect(card.number).toBeLessThanOrEqual(14);
      }
    });
  });

  it('should have 14 cards per minor suit', () => {
    const suits = ['wands', 'cups', 'swords', 'pentacles'];
    suits.forEach(suit => {
      const suitCards = TAROT_DECK.filter(c => c.suit === suit);
      expect(suitCards.length).toBe(14);
      
      const ranks = suitCards.map(c => c.rank);
      const uniqueRanks = new Set(ranks);
      expect(uniqueRanks.size).toBe(14);
    });
  });
});
