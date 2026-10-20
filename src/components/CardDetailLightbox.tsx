import React, { useEffect } from 'react';
import { PositionedCard } from '../types/tarot';
import { getCardKeywords } from '../data/keywords';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface CardDetailLightboxProps {
  positionedCard: PositionedCard;
  slotIndex: number;
  allSelectedCards: PositionedCard[];
  onSelectSlot: (index: number) => void;
  onFlipCard?: (cardId: string) => void;
  onClose: () => void;
  isEnlarged?: boolean;
  onToggleEnlarge?: () => void;
  isMobile?: boolean;
}

const SLOT_TITLES = ['PAST', 'PRESENT', 'FUTURE'];

export const CardDetailLightbox: React.FC<CardDetailLightboxProps> = ({
  positionedCard,
  slotIndex,
  allSelectedCards,
  onSelectSlot,
  onFlipCard,
  onClose,
  isEnlarged = false,
  onToggleEnlarge,
  isMobile = false,
}) => {
  const containerRef = useFocusTrap<HTMLDivElement>({
    isActive: true,
    onEscape: onClose,
  });

  // Arrow key navigation & Touch swipe gestures across companion cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && slotIndex < 2) {
        if (allSelectedCards[slotIndex + 1]) {
          onSelectSlot(slotIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' && slotIndex > 0) {
        if (allSelectedCards[slotIndex - 1]) {
          onSelectSlot(slotIndex - 1);
        }
      }
    };

    let touchStartX: number | null = null;
    let touchStartY: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      if (e.changedTouches.length === 0) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Minimum horizontal displacement to distinguish intentional swipe from vertical scroll
      const SWIPE_THRESHOLD = 40;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0 && slotIndex < 2) {
          // Swipe Left -> Next Card (e.g. Past -> Present -> Future)
          if (allSelectedCards[slotIndex + 1]) {
            onSelectSlot(slotIndex + 1);
          }
        } else if (deltaX > 0 && slotIndex > 0) {
          // Swipe Right -> Previous Card (e.g. Future -> Present -> Past)
          if (allSelectedCards[slotIndex - 1]) {
            onSelectSlot(slotIndex - 1);
          }
        }
      }

      touchStartX = null;
      touchStartY = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [slotIndex, allSelectedCards, onSelectSlot]);

  const slotTitle = SLOT_TITLES[slotIndex] || `CARD ${slotIndex + 1}`;
  const isRevealed = positionedCard.isRevealed;
  const isReversed = positionedCard.orientation === 'reversed';
  const meaningText = isReversed
    ? positionedCard.card.reversedMeaning
    : positionedCard.card.uprightMeaning;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`${slotTitle} card: ${isRevealed ? positionedCard.card.name : 'Unrevealed'}`}
      className="fixed inset-0 pointer-events-none outline-none"
      style={{ zIndex: 140000 }}
    >
      {/* Dimmed Lightbox Backdrop with Opacity & Blur Behind the 3D Cards */}
      <div
        data-testid="lightbox-backdrop"
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 pointer-events-auto cursor-pointer"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 20, 48, 0.88) 0%, rgba(3, 5, 14, 0.96) 80%)',
        }}
        onClick={onClose}
        title="Click outside to return to spread"
      />

      {/* Top Header: Spread Slot Selector Tabs Centered */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-[220000] px-4 sm:px-8 flex items-center justify-center pointer-events-auto animate-fade-in">
        {/* Spread Slot Selector Tabs - Centered */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.08] border border-white/10 rounded-full p-1 backdrop-blur-md shadow-lg">
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
                    ? 'bg-amber-400/25 text-amber-200 border border-amber-300/40 shadow-lg shadow-amber-500/10'
                    : hasCard
                      ? 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent cursor-pointer'
                      : 'text-white/35 border border-transparent cursor-not-allowed'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {onToggleEnlarge && (
          <div className="absolute right-4 sm:right-8 flex items-center">
            <button
              type="button"
              onClick={onToggleEnlarge}
              aria-label={isEnlarged ? 'Standard card view' : 'Enlarge card view'}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/10 text-white/90 hover:text-white transition-colors duration-300 text-[10px] sm:text-xs tracking-wider uppercase group shadow-lg cursor-pointer"
            >
              <span className="hidden sm:inline">{isEnlarged ? 'Standard' : 'Enlarge'}</span>
              <span className="text-amber-300 font-serif text-sm">{isEnlarged ? '⤡' : '⤢'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Reading Details Panel: Switches to Right Column on Desktop when Enlarged */}
      <div
        className={`fixed z-[220000] pointer-events-auto transition-all duration-500 ease-out ${
          isEnlarged
            ? 'top-20 sm:top-24 bottom-6 md:top-20 md:bottom-8 md:left-[46%] md:right-8 lg:right-16 md:w-auto flex flex-col justify-center items-start text-left px-4 sm:px-6 md:px-8 overflow-y-auto'
            : 'top-[calc(50%-45px)] sm:top-[calc(50%+60px)] md:top-[calc(50%+76px)] bottom-2 left-0 right-0 flex flex-col items-center px-4 overflow-y-auto'
        } ${isEnlarged && isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-fade-in'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={`w-full flex flex-col ${
            isEnlarged
              ? 'md:items-start md:text-left items-center text-center max-w-xl md:max-w-2xl bg-[#070b1a]/92 md:border md:border-white/15 md:rounded-3xl md:p-6 lg:p-8 md:backdrop-blur-md md:shadow-2xl my-auto'
              : 'items-center text-center max-w-xl my-0 sm:my-auto pt-1 sm:pt-0 pb-4'
          }`}
        >
          {/* Slot Title & Status Badges */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
              {slotTitle}
            </span>
            {isRevealed ? (
              isReversed ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/35">
                  Reversed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                  Upright
                </span>
              )
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-200 border border-amber-400/35">
                Face Down
              </span>
            )}
          </div>

          {isRevealed ? (
            <>
              {/* Card Name */}
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-serif text-white tracking-wide mb-1 font-medium"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
              >
                {positionedCard.card.name}
              </h2>

              <p className="text-white/75 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] mb-2 sm:mb-2.5 font-light">
                {positionedCard.card.arcana === 'major'
                  ? 'Major Arcana'
                  : `${positionedCard.card.suit?.toUpperCase()} • MINOR ARCANA`}
              </p>

              {/* Key Themes / Short Phrases */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-md mb-2.5 sm:mb-3 px-2">
                {getCardKeywords(positionedCard.card, positionedCard.orientation).map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-light tracking-wide bg-amber-400/10 border border-amber-400/25 text-amber-200/95"
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
              <p className="text-white/70 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2 font-light">
                Swipe left/right to switch • Tap card to enlarge • Tap outside to return
              </p>
            </>
          ) : (
            <>
              {/* Unrevealed / Mystery Header */}
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-serif text-white/95 tracking-wide mb-1 font-medium"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
              >
                Veiled Arcana
              </h2>

              <p className="text-white/75 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] mb-3 font-light">
                Destiny Awaits • {slotTitle}
              </p>

              {/* Prompt to Turn Card Over */}
              <div className="w-full max-w-lg bg-[#070b1a]/92 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl flex flex-col items-center">
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-light tracking-wide mb-3 text-center">
                  This card is face down. Tap the card above to turn it over and unveil its
                  celestial insight.
                </p>
                {onFlipCard && (
                  <button
                    type="button"
                    onClick={() => onFlipCard(positionedCard.card.id)}
                    className="px-5 py-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs sm:text-sm tracking-widest uppercase font-medium transition-all duration-300 shadow-lg hover:shadow-amber-500/20 cursor-pointer flex items-center gap-2 group"
                  >
                    <span>Turn Over Card</span>
                    <span className="text-amber-400 text-sm group-hover:rotate-45 transition-transform duration-500">
                      ✦
                    </span>
                  </button>
                )}
              </div>

              {/* Interaction Helper Hint */}
              <p className="text-white/70 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2 font-light">
                Swipe left/right or tap cards behind to switch • Tap card to turn over
              </p>
            </>
          )}
        </div>
      </div>

      {/* Mobile Enlarge Dismissal Floating Pill */}
      {isEnlarged && onToggleEnlarge && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[230000] pointer-events-auto md:hidden animate-fade-in">
          <button
            type="button"
            onClick={onToggleEnlarge}
            className="px-4 py-2 rounded-full bg-black/85 border border-amber-400/50 text-amber-200 text-xs tracking-wider uppercase backdrop-blur-md shadow-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <span>Tap card to view meaning</span>
            <span className="text-amber-300">✦</span>
          </button>
        </div>
      )}
    </div>
  );
};
