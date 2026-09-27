import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ReadingPersistence } from './persistence';
import { PersistedReading, ReadingPhase } from '../types/tarot';

const mockDate = new Date('2026-09-27T12:00:00Z');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

describe('ReadingPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const getValidReading = (dateStr: string): PersistedReading => ({
    version: 1,
    date: dateStr,
    phase: 'fan' as ReadingPhase,
    availableCardIds: ['major-0', 'wands-1'],
    drawnCardsData: [],
    initialShuffledDeckIds: ['wands-1', 'major-0'],
    selectedCardsData: []
  });

  it('New day creates a new reading (returns null)', () => {
    const oldReading = getValidReading('2026-09-26');
    ReadingPersistence.saveReading(oldReading);
    
    // System time is 2026-09-27
    const result = ReadingPersistence.getTodaysReading();
    expect(result).toBeNull();
    // Verify it clears it
    expect(localStorage.getItem('daily_tarot_reading_v2')).toBeNull();
  });

  it('Same day restores the same reading', () => {
    const today = ReadingPersistence.getTodayDateString();
    const todayReading = getValidReading(today);
    todayReading.phase = 'place';
    
    ReadingPersistence.saveReading(todayReading);
    
    const result = ReadingPersistence.getTodaysReading();
    expect(result).not.toBeNull();
    expect(result?.phase).toBe('place');
    expect(result?.availableCardIds).toEqual(['major-0', 'wands-1']);
  });

  it('Corrupt persistence does not crash the app and returns null', () => {
    localStorage.setItem('daily_tarot_reading_v2', '{ corrupt json ');
    
    expect(() => {
      const result = ReadingPersistence.getTodaysReading();
      expect(result).toBeNull();
    }).not.toThrow();
  });

  it('Invalid schema does not crash the app and clears it', () => {
    // Missing required arrays
    localStorage.setItem('daily_tarot_reading_v2', JSON.stringify({ version: 1, date: '2026-09-27' }));
    
    expect(() => {
      const result = ReadingPersistence.getTodaysReading();
      expect(result).toBeNull();
    }).not.toThrow();
    
    expect(localStorage.getItem('daily_tarot_reading_v2')).toBeNull();
  });
});
