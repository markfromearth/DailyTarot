import React, { useEffect } from 'react';
import { PositionedCard } from '../types/tarot';
import { getCardKeywords } from '../data/keywords';

interface CardDetailLightboxProps {
  positionedCard: PositionedCard;
  slotIndex: number;
  allSelectedCards: PositionedCard[];
  onSelectSlot: (index: number) => void;
  onClose: () => void;
}

const SLOT_TITLES = ['PAST', 'PRESENT', 'FUTURE'];

export const CardDetailLightbox: React.FC<CardDetailLightboxProps> = ({
  positionedCard,
  slotIndex,
  allSelectedCards,
  onSelectSlot,
  onClose,
}) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && slotIndex < 2) {
        if (allSelectedCards[slotIndex + 1]?.isRevealed) {
          onSelectSlot(slotIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' && slotIndex > 0) {
        if (allSelectedCards[slotIndex - 1]?.isRevealed) {
          onSelectSlot(slotIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slotIndex, allSelectedCards, onSelectSlot, onClose]);

  const slotTitle = SLOT_TITLES[slotIndex] || `CARD ${slotIndex + 1}`;
  const isReversed = positionedCard.orientation === 'reversed';
  const meaningText = isReversed
    ? positionedCard.card.reversedMeaning
    : positionedCard.card.uprightMeaning;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${slotTitle} card: ${positionedCard.card.name}`}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 140000 }}
    >
      {/* Dimmed Lightbox Backdrop with Opacity & Blur Behind the 3D Cards */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 pointer-events-auto"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 20, 48, 0.88) 0%, rgba(3, 5, 14, 0.96) 80%)',
        }}
        onClick={onClose}
      />

      {/* Top Header: Spread Slot Selector Tabs & Close Button */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-[220000] px-4 sm:px-8 max-w-4xl mx-auto flex items-center justify-between pointer-events-auto animate-fade-in">
        {/* Spread Slot Selector Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.08] border border-white/10 rounded-full p-1 backdrop-blur-md shadow-lg">
          {SLOT_TITLES.map((title, idx) => {
            const cardAtSlot = allSelectedCards[idx];
            const isActive = idx === slotIndex;
            const hasCard = !!cardAtSlot && cardAtSlot.isRevealed;

            return (
              <button
                key={title}
                type="button"
                disabled={!hasCard}
                onClick={() => onSelectSlot(idx)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-400/25 text-amber-200 border border-amber-300/40 shadow-lg shadow-amber-500/10'
                    : hasCard
                    ? 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent cursor-pointer'
                    : 'text-white/20 border border-transparent cursor-not-allowed'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Close Inspect Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close card detail view"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/10 text-white/80 hover:text-white transition-all text-xs tracking-wider uppercase group shadow-lg cursor-pointer"
        >
          <span>Return to Spread</span>
          <span className="text-sm leading-none group-hover:scale-110 transition-transform">✕</span>
        </button>
      </header>

      {/* Reading Details Panel: Positioned cleanly below the 3D fanned cards with safe clearance */}
      <div className="fixed top-[calc(50%+60px)] sm:top-[calc(50%+76px)] md:top-[calc(50%+88px)] bottom-2 left-0 right-0 z-[220000] flex flex-col items-center px-4 overflow-y-auto pointer-events-auto animate-fade-in">
        <div className="w-full max-w-xl flex flex-col items-center text-center my-auto pb-4">
          {/* Slot Title & Orientation Badges */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
              {slotTitle}
            </span>
            {isReversed ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/35">
                Reversed
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                Upright
              </span>
            )}
          </div>

          {/* Card Name */}
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-serif text-white tracking-wide mb-1 font-medium"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
          >
            {positionedCard.card.name}
          </h2>

          <p className="text-white/45 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] mb-2 sm:mb-2.5 font-light">
            {positionedCard.card.arcana === 'major'
              ? 'Major Arcana'
              : `${positionedCard.card.suit?.toUpperCase()} • MINOR ARCANA`}
          </p>

          {/* Key Themes / Short Phrases */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md mb-2.5 sm:mb-3 px-2">
            {getCardKeywords(positionedCard.card, positionedCard.orientation).map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-light tracking-wide bg-amber-400/10 border border-amber-400/25 text-amber-200/90"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* Frosted Meaning Container for Optimal Readability */}
          <div className="w-full max-w-lg bg-[#070b1a]/92 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl max-h-[22vh] sm:max-h-[26vh] overflow-y-auto">
            <p className="text-white/95 text-xs sm:text-sm md:text-base leading-relaxed font-light tracking-wide">
              {meaningText}
            </p>
          </div>

          {/* Interaction Helper Hint */}
          <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2 font-light">
            Tap companion cards to inspect • Click outside or ESC to return
          </p>
        </div>
      </div>
    </div>
  );
};
