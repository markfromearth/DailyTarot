import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReading } from './useReading';
import { ReadingPersistence } from '../store/persistence';

describe('Ritual State Machine (useReading)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Reset singleton or persistence before each test
    ReadingPersistence.clearReading();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('progresses from intro -> shuffling -> fan', () => {
    const { result } = renderHook(() => useReading());
    
    // Initial state
    expect(result.current.phase).toBe('intro');
    
    // Trigger shuffle
    act(() => {
      result.current.beginShuffle();
    });
    
    // Enters shuffling state
    expect(result.current.phase).toBe('shuffling');
    
    // Wait for shuffle timeout
    act(() => {
      vi.runAllTimers();
    });
    
    // Enters fan state
    expect(result.current.phase).toBe('fan');
    expect(result.current.initialDeckOrder.length).toBe(78);
  });

  it('allows precisely 3 selections and transitions to place', () => {
    const { result } = renderHook(() => useReading());
    
    // Fast-forward to fan
    act(() => { result.current.beginShuffle(); });
    act(() => { vi.runAllTimers(); });
    
    const deck = result.current.initialDeckOrder;
    
    // Select Card 1
    act(() => { result.current.selectCardFromFan(deck[0].id); });
    expect(result.current.selectedCards.length).toBe(1);
    expect(result.current.phase).toBe('fan');
    
    // Select Card 2
    act(() => { result.current.selectCardFromFan(deck[1].id); });
    expect(result.current.selectedCards.length).toBe(2);
    expect(result.current.phase).toBe('fan');
    
    // Select Card 3
    act(() => { result.current.selectCardFromFan(deck[2].id); });
    expect(result.current.selectedCards.length).toBe(3);
    
    // Transitions to place
    expect(result.current.phase).toBe('place');

    // Attempting to select a 4th card does nothing
    act(() => { result.current.selectCardFromFan(deck[3].id); });
    expect(result.current.selectedCards.length).toBe(3);
  });

  it('prevents selecting the same card twice', () => {
    const { result } = renderHook(() => useReading());
    
    // Fast-forward to fan
    act(() => { result.current.beginShuffle(); });
    act(() => { vi.runAllTimers(); });
    
    const deck = result.current.initialDeckOrder;
    
    // Select Card 1
    act(() => { result.current.selectCardFromFan(deck[0].id); });
    
    // Attempt to select Card 1 again
    act(() => { result.current.selectCardFromFan(deck[0].id); });
    
    expect(result.current.selectedCards.length).toBe(1); // Still 1
  });

  it('prevents revealing before all 3 are selected', () => {
    const { result } = renderHook(() => useReading());
    
    // Fast-forward to fan
    act(() => { result.current.beginShuffle(); });
    act(() => { vi.runAllTimers(); });
    
    const deck = result.current.initialDeckOrder;
    
    // Select Card 1
    act(() => { result.current.selectCardFromFan(deck[0].id); });
    expect(result.current.phase).toBe('fan');
    
    // Attempt to flip it prematurely
    act(() => { result.current.flipCard(deck[0].id); });
    
    // It remains unrevealed
    expect(result.current.selectedCards[0].isRevealed).toBe(false);
  });

  it('allows individual reveals and transitions to read upon completion', () => {
    const { result } = renderHook(() => useReading());
    
    // Fast-forward to place
    act(() => { result.current.beginShuffle(); });
    act(() => { vi.runAllTimers(); });
    const deck = result.current.initialDeckOrder;
    act(() => { result.current.selectCardFromFan(deck[0].id); });
    act(() => { result.current.selectCardFromFan(deck[1].id); });
    act(() => { result.current.selectCardFromFan(deck[2].id); });
    
    expect(result.current.phase).toBe('place');

    // Flip Card 1
    act(() => { result.current.flipCard(deck[0].id); });
    expect(result.current.selectedCards[0].isRevealed).toBe(true);
    expect(result.current.phase).toBe('place'); // still placing

    // Flip Card 2
    act(() => { result.current.flipCard(deck[1].id); });
    expect(result.current.selectedCards[1].isRevealed).toBe(true);
    expect(result.current.phase).toBe('place'); // still placing

    // Flip Card 3
    act(() => { result.current.flipCard(deck[2].id); });
    expect(result.current.selectedCards[2].isRevealed).toBe(true);
    
    // Transitions to read state
    expect(result.current.phase).toBe('read');
  });
});
