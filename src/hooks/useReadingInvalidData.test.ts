import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReading } from './useReading';
import { ReadingPersistence } from '../store/persistence';
import { PersistedReading } from '../types/tarot';

const mockDate = new Date('2026-09-27T12:00:00Z');

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

describe('useReading - Invalid Data Recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears reading if saved selected cards contain invalid IDs', () => {
    const invalidReading: PersistedReading = {
      version: 1,
      date: '2026-09-27',
      phase: 'place',
      availableCardIds: ['wands-1'],
      drawnCardsData: [{ id: 'fake-card-id', orientation: 'upright' }],
      initialShuffledDeckIds: ['wands-1', 'fake-card-id'],
      selectedCardsData: [
        { id: 'fake-card-id', orientation: 'upright', position: 'past', isRevealed: false }
      ]
    };
    
    ReadingPersistence.saveReading(invalidReading);

    const { result } = renderHook(() => useReading());
    
    // Because fake-card-id doesn't exist in TAROT_DECK, the hook should gracefully clear local storage 
    // and drop back to the 'intro' phase instead of crashing.
    expect(result.current.phase).toBe('intro');
    expect(localStorage.getItem('daily_tarot_reading_v2')).toBeNull();
  });
});
