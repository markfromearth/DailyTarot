import React from 'react';
import { ReadingPhase, PositionedCard } from '../types/tarot';
import { formatCardKeywords } from '../data/keywords';
import { getSlotCoordinate } from '../constants/layout';

interface ReadingSlotsProps {
  phase: ReadingPhase;
  selectedCards: PositionedCard[];
  viewportWidth: number;
  onCardClick?: (cardId: string) => void;
  isInspecting?: boolean;
}

export const ReadingSlots: React.FC<ReadingSlotsProps> = ({
  phase,
  selectedCards,
  viewportWidth,
  onCardClick,
  isInspecting = false,
}) => {
  if (phase === 'intro' || phase === 'shuffling') return null;

  const slots = [
    { title: 'PAST', index: 0 },
    { title: 'PRESENT', index: 1 },
    { title: 'FUTURE', index: 2 },
  ];

  const isMobile = viewportWidth < 768;

  return (
    <>
      {slots.map((slot) => {
        const { x: xPos, y: yPos } = getSlotCoordinate(slot.index, isMobile);
        const positionedCard = selectedCards[slot.index];

        return (
          <div
            key={slot.index}
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center pointer-events-none transition-opacity duration-400 ${
              isInspecting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              transform: `translate(${xPos}px, ${yPos}px)`,
              zIndex: 10,
            }}
          >
            {/* Slot Position Title */}
            <div className="absolute -top-8 text-center w-36 drop-shadow-md">
              <p
                className="text-white/85 tracking-[0.3em] text-[10px] sm:text-[11px] md:text-xs uppercase font-medium"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                {slot.title}
              </p>
            </div>

            {/* Glowing Golden Slot Frame */}
            <div
              className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-700 ${
                positionedCard
                  ? 'border border-amber-300/35 shadow-[0_0_22px_rgba(245,207,109,0.32),0_0_45px_rgba(212,163,41,0.16)]'
                  : 'border border-white/10'
              }`}
            >
              {/* Empty slot placeholder */}
            </div>

            {/* Revealed Card Container — Mockup Presentation */}
            <div
              className={`absolute top-[103%] text-center drop-shadow-md z-50 ${
                isMobile ? 'w-[108px]' : 'w-[168px]'
              }`}
            >
              {positionedCard?.isRevealed ? (
                <div
                  onClick={() => onCardClick?.(positionedCard.card.id)}
                  className="animate-fade-in pointer-events-auto mt-2 cursor-pointer group p-3 sm:p-3.5 md:p-4 rounded-2xl bg-[#060a18]/92 hover:bg-[#080d22] border border-white/10 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-md shadow-2xl shadow-black/80 flex flex-col items-center"
                  title="Click to inspect card and view full details"
                >
                  {/* Card Name */}
                  <h3
                    className="text-white group-hover:text-amber-200 font-serif text-sm sm:text-base md:text-lg font-medium leading-tight mb-1 transition-colors truncate w-full"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                  >
                    {positionedCard.card.name}
                  </h3>

                  {/* Orientation Status */}
                  {positionedCard.orientation === 'reversed' ? (
                    <p
                      className="text-rose-400 font-bold tracking-[0.2em] text-[8px] sm:text-[9px] md:text-[10px] uppercase mb-1.5"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      Reversed
                    </p>
                  ) : (
                    <p
                      className="text-emerald-400 font-bold tracking-[0.2em] text-[8px] sm:text-[9px] md:text-[10px] uppercase mb-1.5"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      Upright
                    </p>
                  )}

                  {/* Semicolon-delimited keywords summary */}
                  <p
                    className="text-white/80 group-hover:text-white/95 text-[9px] sm:text-[10px] md:text-xs leading-relaxed font-light mb-2.5 line-clamp-3 transition-colors tracking-wide"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {formatCardKeywords(positionedCard.card, positionedCard.orientation)};...
                  </p>

                  {/* Action Link: INSPECT ↗ */}
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.22em] text-amber-300 group-hover:text-amber-200 uppercase font-semibold transition-all duration-200 group-hover:translate-x-0.5">
                    INSPECT ↗
                  </span>
                </div>
              ) : (
                positionedCard && (
                  <div
                    onClick={() => onCardClick?.(positionedCard.card.id)}
                    className="animate-fade-in pointer-events-auto mt-2 cursor-pointer group p-3 sm:p-3.5 rounded-2xl bg-[#060a18]/92 hover:bg-[#080d22] border border-white/10 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col items-center"
                    title="Click to turn over card"
                  >
                    <p className="text-white/90 group-hover:text-amber-200 font-serif text-sm font-medium mb-1">
                      Veiled Arcana
                    </p>
                    <p className="text-amber-300/80 text-[9px] uppercase tracking-widest font-semibold mb-1">
                      Face Down
                    </p>
                    <span className="text-[9px] tracking-widest text-amber-300 uppercase">
                      Tap to reveal ↗
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
