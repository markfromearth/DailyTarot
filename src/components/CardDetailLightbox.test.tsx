import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CardDetailLightbox } from './CardDetailLightbox';
import { PositionedCard } from '../types/tarot';

afterEach(() => {
  cleanup();
});

const mockCard: PositionedCard = {
  card: {
    id: 'major-0',
    name: 'The Fool',
    arcana: 'major',
    suit: null,
    rank: null,
    number: 0,
    uprightMeaning: 'New beginnings, optimism, trust in life.',
    reversedMeaning: 'Recklessness, risk-taking, bad judgment.',
    imageUrl: '/cards/card_the_fool.jpg',
  },
  position: 'past',
  orientation: 'upright',
  isRevealed: true,
};

const mockCard2: PositionedCard = {
  card: {
    id: 'major-1',
    name: 'The Magician',
    arcana: 'major',
    suit: null,
    rank: null,
    number: 1,
    uprightMeaning: 'Willpower, desire, creation, manifestation.',
    reversedMeaning: 'Trickery, illusions, out of touch.',
    imageUrl: '/cards/card_the_magician.jpg',
  },
  position: 'present',
  orientation: 'reversed',
  isRevealed: true,
};

describe('CardDetailLightbox', () => {
  it('renders the card name, slot title, and upright meaning correctly', () => {
    render(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText('The Fool')[0]).toBeDefined();
    expect(screen.getAllByText('PAST')[0]).toBeDefined();
    expect(screen.getByText('Upright')).toBeDefined();
    expect(screen.getByText('New beginnings, optimism, trust in life.')).toBeDefined();
  });

  it('renders reversed meaning and badge when card is reversed', () => {
    render(
      <CardDetailLightbox
        positionedCard={mockCard2}
        slotIndex={1}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText('The Magician')[0]).toBeDefined();
    expect(screen.getAllByText('PRESENT')[0]).toBeDefined();
    expect(screen.getByText('Reversed')).toBeDefined();
    expect(screen.getByText('Trickery, illusions, out of touch.')).toBeDefined();
  });

  it('triggers onClose when Close button or Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close card detail view/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('triggers onSelectSlot when clicking a slot navigation pill', () => {
    const handleSelectSlot = vi.fn();
    render(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={handleSelectSlot}
        onClose={vi.fn()}
      />
    );

    const presentBtn = screen.getByRole('button', { name: 'PRESENT' });
    fireEvent.click(presentBtn);
    expect(handleSelectSlot).toHaveBeenCalledWith(1);
  });

  it('navigates with left and right arrow keys', () => {
    const handleSelectSlot = vi.fn();
    render(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={handleSelectSlot}
        onClose={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(handleSelectSlot).toHaveBeenCalledWith(1);
  });

  it('renders face-down unrevealed card safely without spoiling name or meaning', () => {
    const unrevealedCard: PositionedCard = {
      ...mockCard,
      isRevealed: false,
    };
    const handleFlip = vi.fn();

    render(
      <CardDetailLightbox
        positionedCard={unrevealedCard}
        slotIndex={0}
        allSelectedCards={[unrevealedCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onFlipCard={handleFlip}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Face Down')).toBeDefined();
    expect(screen.getByText('Veiled Arcana')).toBeDefined();
    expect(screen.queryByText('The Fool')).toBeNull();
    expect(screen.queryByText('New beginnings, optimism, trust in life.')).toBeNull();

    const turnOverBtn = screen.getByRole('button', { name: /turn over card/i });
    fireEvent.click(turnOverBtn);
    expect(handleFlip).toHaveBeenCalledWith('major-0');
  });
});
