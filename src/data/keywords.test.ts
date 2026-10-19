import { describe, it, expect } from 'vitest';
import { getCardKeywords, formatCardKeywords, CARD_KEYWORDS } from './keywords';
import { TarotCard } from '../types/tarot';

const theFool: TarotCard = {
  id: 'major-0',
  name: 'The Fool',
  arcana: 'major',
  uprightMeaning: 'New beginnings, optimism, trust.',
  reversedMeaning: 'Being gullible and naive. Taking risks.',
};

describe('Tarot Keywords System', () => {
  it('contains comprehensive keyword mappings for major and minor arcana', () => {
    expect(CARD_KEYWORDS['major-0']).toBeDefined();
    expect(CARD_KEYWORDS['wands-14']).toBeDefined();
    expect(CARD_KEYWORDS['cups-12']).toBeDefined();
    expect(CARD_KEYWORDS['pentacles-2']).toBeDefined();
  });

  it('returns exact requested keywords for The Fool (reversed)', () => {
    const reversedKeywords = getCardKeywords(theFool, 'reversed');
    expect(reversedKeywords).toEqual([
      'Holding back',
      'Indecision',
      'Recklessness',
      'Bad choices',
      'Risk-taking',
    ]);

    const formatted = formatCardKeywords(theFool, 'reversed');
    expect(formatted).toBe('Holding back; Indecision; Recklessness; Bad choices; Risk-taking');
  });

  it('returns upright keywords for The Fool', () => {
    const uprightKeywords = getCardKeywords(theFool, 'upright');
    expect(uprightKeywords).toEqual([
      'New beginnings',
      'Innocence',
      'Leap of faith',
      'Spontaneity',
      'Curiosity',
    ]);
  });

  it('gracefully falls back to parsed meaning sentences if card ID is unmapped', () => {
    const unmappedCard: TarotCard = {
      id: 'custom-card-99',
      name: 'The Mystery',
      arcana: 'major',
      uprightMeaning: 'Hidden wisdom. Cosmic wonder. Deep peace.',
      reversedMeaning: 'Veiled doubts. Restless shadows.',
    };

    const upright = getCardKeywords(unmappedCard, 'upright');
    expect(upright).toEqual(['Hidden wisdom', 'Cosmic wonder', 'Deep peace']);

    const reversed = getCardKeywords(unmappedCard, 'reversed');
    expect(reversed).toEqual(['Veiled doubts', 'Restless shadows']);
  });
});
