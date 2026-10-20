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

  it('navigates to next card on swipe left and previous card on swipe right', () => {
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

    // Swipe Left: Start at x=200, End at x=100 (deltaX = -100px)
    fireEvent.touchStart(window, {
      touches: [{ clientX: 200, clientY: 300 }],
    });
    fireEvent.touchEnd(window, {
      changedTouches: [{ clientX: 100, clientY: 305 }],
    });

    expect(handleSelectSlot).toHaveBeenCalledWith(1);
    handleSelectSlot.mockClear();

    // Swipe Right on slot 1: Start at x=100, End at x=220 (deltaX = +120px)
    render(
      <CardDetailLightbox
        positionedCard={mockCard2}
        slotIndex={1}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={handleSelectSlot}
        onClose={vi.fn()}
      />
    );

    fireEvent.touchStart(window, {
      touches: [{ clientX: 100, clientY: 300 }],
    });
    fireEvent.touchEnd(window, {
      changedTouches: [{ clientX: 220, clientY: 302 }],
    });

    expect(handleSelectSlot).toHaveBeenCalledWith(0);
    handleSelectSlot.mockClear();

    // Vertical scroll (deltaY = 150px, deltaX = 10px) should NOT switch cards
    fireEvent.touchStart(window, {
      touches: [{ clientX: 150, clientY: 200 }],
    });
    fireEvent.touchEnd(window, {
      changedTouches: [{ clientX: 160, clientY: 350 }],
    });

    expect(handleSelectSlot).not.toHaveBeenCalled();
  });

  it('triggers onToggleEnlarge when clicking the Enlarge/Standard toggle button', () => {
    const handleToggleEnlarge = vi.fn();
    const { rerender } = render(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onClose={vi.fn()}
        isEnlarged={false}
        onToggleEnlarge={handleToggleEnlarge}
      />
    );

    const enlargeBtn = screen.getByRole('button', { name: /enlarge card view/i });
    expect(enlargeBtn).toBeDefined();
    fireEvent.click(enlargeBtn);
    expect(handleToggleEnlarge).toHaveBeenCalledTimes(1);

    rerender(
      <CardDetailLightbox
        positionedCard={mockCard}
        slotIndex={0}
        allSelectedCards={[mockCard, mockCard2]}
        onSelectSlot={vi.fn()}
        onClose={vi.fn()}
        isEnlarged={true}
        onToggleEnlarge={handleToggleEnlarge}
      />
    );

    const standardBtn = screen.getByRole('button', { name: /standard card view/i });
    expect(standardBtn).toBeDefined();
    fireEvent.click(standardBtn);
    expect(handleToggleEnlarge).toHaveBeenCalledTimes(2);
  });
});
