import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { DeckExperience } from './DeckExperience';
import { TAROT_DECK } from '../data/cards';
import { PositionedCard } from '../types/tarot';

describe('DeckExperience Integration', () => {
  const mockCards = TAROT_DECK.slice(0, 10);
  const onStartShuffle = vi.fn();
  const onSelectCard = vi.fn();
  const onFlipCard = vi.fn();
  const onResetReading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly in intro phase with visible orbit cards', () => {
    const { getByText, getAllByRole } = render(
      <DeckExperience
        phase="intro"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    expect(getByText(/SWIPE TO SHUFFLE/i)).toBeTruthy();

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('triggers onStartShuffle when clicking the Shuffle button in intro', () => {
    const { getByRole } = render(
      <DeckExperience
        phase="intro"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const shuffleBtn = getByRole('button', { name: /Shuffle the deck/i });
    fireEvent.click(shuffleBtn);

    expect(onStartShuffle).toHaveBeenCalledTimes(1);
  });

  it('triggers onSelectCard when clicking an available card in fan phase', () => {
    const { getAllByRole } = render(
      <DeckExperience
        phase="fan"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const cardButtons = getAllByRole('button', { name: /Select Tarot Card/i });
    expect(cardButtons.length).toBeGreaterThan(0);

    fireEvent.click(cardButtons[0]);
    expect(onSelectCard).toHaveBeenCalledTimes(1);
    expect(onSelectCard).toHaveBeenCalledWith(mockCards[0].id);
  });

  it('triggers onResetReading when clicking the Reshuffle Deck button in fan phase', () => {
    const { getByRole } = render(
      <DeckExperience
        phase="fan"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const reshuffleBtn = getByRole('button', { name: /Reshuffle the deck/i });
    fireEvent.click(reshuffleBtn);

    expect(onResetReading).toHaveBeenCalledTimes(1);
  });

  it('allows clicking an unrevealed card in place phase to flip it', () => {
    const selected: PositionedCard[] = [
      { card: mockCards[0], orientation: 'upright', position: 'past', isRevealed: false },
      { card: mockCards[1], orientation: 'upright', position: 'present', isRevealed: false },
      { card: mockCards[2], orientation: 'upright', position: 'future', isRevealed: false },
    ];

    const { getAllByRole } = render(
      <DeckExperience
        phase="place"
        initialDeckOrder={mockCards}
        selectedCards={selected}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const cardButtons = getAllByRole('button', { name: /Select Tarot Card/i });
    fireEvent.click(cardButtons[0]);

    expect(onFlipCard).toHaveBeenCalledWith(mockCards[0].id);
  });

  it('triggers onStartShuffle when swiping across the card ring in intro phase', () => {
    const { container } = render(
      <DeckExperience
        phase="intro"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const gestureContainer = container.querySelector('.relative.w-full.h-full');
    expect(gestureContainer).toBeTruthy();

    if (gestureContainer) {
      // Simulate quick swipe right
      fireEvent.pointerDown(gestureContainer, { clientX: 100, clientY: 200 });
      fireEvent.pointerMove(gestureContainer, { clientX: 220, clientY: 205 });
      fireEvent.pointerUp(gestureContainer, { clientX: 240, clientY: 208 });

      expect(onStartShuffle).toHaveBeenCalledTimes(1);
    }
  });

  it('handles two-finger touch gestures without errors', () => {
    const { container } = render(
      <DeckExperience
        phase="intro"
        initialDeckOrder={mockCards}
        selectedCards={[]}
        onStartShuffle={onStartShuffle}
        onSelectCard={onSelectCard}
        onFlipCard={onFlipCard}
        onResetReading={onResetReading}
      />
    );

    const gestureContainer = container.querySelector('.relative.w-full.h-full');
    expect(gestureContainer).toBeTruthy();

    if (gestureContainer) {
      // Pinch start with 2 fingers
      fireEvent.touchStart(gestureContainer, {
        touches: [
          { clientX: 100, clientY: 200 },
          { clientX: 200, clientY: 200 },
        ],
      });

      // Pinch zoom in (distance expands to 200px)
      fireEvent.touchMove(gestureContainer, {
        touches: [
          { clientX: 80, clientY: 200 },
          { clientX: 280, clientY: 200 },
        ],
      });

      // Lift touches
      fireEvent.touchEnd(gestureContainer, { touches: [] });
    }
  });
});
