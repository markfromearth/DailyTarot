import React, { useEffect } from 'react';
import { PositionedCard } from '../types/tarot';
import { TarotCardView } from './TarotCardView';

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
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && slotIndex < 2) {
        onSelectSlot(slotIndex + 1);
      } else if (e.key === 'ArrowLeft' && slotIndex > 0) {
        onSelectSlot(slotIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slotIndex, onSelectSlot, onClose]);

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
      className="fixed inset-0 z-[250000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Dimmed Lightbox Backdrop with Opacity & Blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 20, 48, 0.88) 0%, rgba(3, 5, 14, 0.96) 80%)',
        }}
        onClick={onClose}
      />

      {/* Lightbox Content Container */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center my-auto py-6 animate-fade-in">
        {/* Top Controls: Slot Navigation Pills & Close Button */}
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6 px-2">
          {/* Spread Slot Selector Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.06] border border-white/10 rounded-full p-1 backdrop-blur-sm">
            {SLOT_TITLES.map((title, idx) => {
              const cardAtSlot = allSelectedCards[idx];
              const isActive = idx === slotIndex;
              const hasCard = !!cardAtSlot;

              return (
                <button
                  key={title}
                  type="button"
                  disabled={!hasCard}
                  onClick={() => onSelectSlot(idx)}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium uppercase transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40 shadow-lg shadow-amber-500/10'
                      : hasCard
                      ? 'text-white/60 hover:text-white/90 hover:bg-white/10 border border-transparent'
                      : 'text-white/20 border border-transparent cursor-not-allowed'
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>

          {/* Close Lightbox Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close card detail view"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all text-xs tracking-wider uppercase group"
          >
            <span>Close</span>
            <span className="text-sm leading-none group-hover:scale-110 transition-transform">✕</span>
          </button>
        </div>

        {/* Surface Card Artwork: Enlarged for High-Impact Detail */}
        <div className="relative w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
          {/* Subtle Ambient Backlight Glow around the card */}
          <div
            className="absolute -inset-3 rounded-2xl opacity-75 blur-xl -z-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(246, 200, 81, 0.45) 0%, rgba(184, 29, 51, 0.25) 50%, transparent 75%)',
            }}
          />

          <TarotCardView
            card={positionedCard.card}
            imageUrl={positionedCard.card.imageUrl}
            orientation={positionedCard.orientation}
            isFlipped={true}
            className="w-full h-full shadow-2xl pointer-events-none"
          />
        </div>

        {/* Card Metadata & High-Legibility Meaning Text */}
        <div className="w-full mt-5 sm:mt-6 flex flex-col items-center text-center">
          {/* Slot & Orientation Badges */}
          <div className="flex items-center gap-2 mb-2">
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
            className="text-2xl sm:text-3xl font-serif text-white tracking-wide mb-1"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
          >
            {positionedCard.card.name}
          </h2>

          <p className="text-white/45 text-[11px] sm:text-xs uppercase tracking-[0.25em] mb-4">
            {positionedCard.card.arcana === 'major'
              ? 'Major Arcana'
              : `${positionedCard.card.suit?.toUpperCase()} • MINOR ARCANA`}
          </p>

          {/* Frosted Meaning Container for Optimal Readability over Background */}
          <div className="w-full max-w-lg bg-[#070b1a]/90 border border-white/15 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl">
            <p className="text-white/95 text-sm sm:text-base leading-relaxed font-light tracking-wide">
              {meaningText}
            </p>
          </div>

          {/* Bottom dismiss helper hint */}
          <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mt-3">
            Press ESC or click outside to return to spread
          </p>
        </div>
      </div>
    </div>
  );
};
