import React from 'react';
import { ReadingPhase, PositionedCard } from '../types/tarot';
import { formatCardKeywords } from '../data/keywords';

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
    { title: 'FUTURE', index: 2 }
  ];

  return (
    <>
      {slots.map((slot) => {
        const isMobile = viewportWidth < 768;
        const cardWidth = isMobile ? 96 : 128;
        const spacing = isMobile ? 14 : 38;
        const totalWidth = (cardWidth * 3) + (spacing * 2);
        const startX = -(totalWidth / 2) + (cardWidth / 2);
        const xPos = startX + (slot.index * (cardWidth + spacing));
        // Lowered yPos to prevent collision with top DAILY TAROT header
        const yPos = isMobile ? -145 : -170;
        
        const positionedCard = selectedCards[slot.index];

        return (
          <div 
            key={slot.index}
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center pointer-events-none transition-opacity duration-400 ${
              isInspecting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              transform: `translate(${xPos}px, ${yPos}px)`,
              zIndex: 10
            }}
          >
            {/* Slot Position Title */}
            <div className="absolute -top-7 text-center w-32 drop-shadow-md">
              <p className="text-white/40 tracking-[0.3em] text-[10px] uppercase font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                {slot.title}
              </p>
            </div>
            
            <div className="w-full h-full border border-white/10 rounded-xl flex items-center justify-center transition-colors duration-1000">
              {/* Empty slot marker */}
            </div>

            {/* Revealed Card Text Block - Strictly bounded width to prevent horizontal collision */}
            <div className={`absolute top-[104%] text-center drop-shadow-md z-50 ${isMobile ? 'w-[102px]' : 'w-[146px]'}`}>
              {positionedCard?.isRevealed && (
                <div 
                  onClick={() => onCardClick?.(positionedCard.card.id)}
                  className="animate-fade-in pointer-events-auto mt-2 cursor-pointer group p-1.5 rounded-xl bg-black/40 hover:bg-black/70 border border-white/5 hover:border-amber-400/30 transition-all duration-300 backdrop-blur-xs"
                  title="Click to enlarge card and read full meaning"
                >
                  <p className="text-white/95 group-hover:text-amber-200 font-serif text-xs md:text-sm leading-tight mb-1 transition-colors font-medium truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {positionedCard.card.name}
                  </p>
                  
                  {positionedCard.orientation === 'reversed' ? (
                    <p className="text-rose-400/80 text-[8px] md:text-[9px] uppercase tracking-[0.2em] mb-1 font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                      Reversed
                    </p>
                  ) : (
                    <p className="text-emerald-400/70 text-[8px] md:text-[9px] uppercase tracking-[0.2em] mb-1 font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                      Upright
                    </p>
                  )}

                  {/* Concise Keywords / Short Phrases Interpretation */}
                  <p className="text-white/75 group-hover:text-white/95 text-[10px] md:text-[11px] leading-snug mt-1 max-w-[136px] mx-auto line-clamp-3 transition-colors font-light tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {formatCardKeywords(positionedCard.card, positionedCard.orientation)}
                  </p>

                  <span className="inline-block mt-1 text-[8px] md:text-[9px] tracking-wider text-amber-300/70 group-hover:text-amber-300 uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                    Inspect ↗
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
