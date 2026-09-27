import React from 'react';
import { ReadingPhase, PositionedCard } from '../types/tarot';

interface ReadingSlotsProps {
  phase: ReadingPhase;
  selectedCards: PositionedCard[];
  viewportWidth: number;
}

export const ReadingSlots: React.FC<ReadingSlotsProps> = ({ phase, selectedCards, viewportWidth }) => {
  if (phase === 'intro' || phase === 'shuffling') return null;

  const slots = [
    { title: 'PAST', index: 0 },
    { title: 'PRESENT', index: 1 },
    { title: 'FUTURE', index: 2 }
  ];

  return (
    <>
      {slots.map((slot) => {
        const cardWidth = viewportWidth < 768 ? 96 : 128;
        const spacing = viewportWidth < 768 ? 10 : 20;
        const totalWidth = (cardWidth * 3) + (spacing * 2);
        const startX = -(totalWidth / 2) + (cardWidth / 2);
        const xPos = startX + (slot.index * (cardWidth + spacing));
        const yPos = viewportWidth < 768 ? -220 : -280;
        
        const positionedCard = selectedCards[slot.index];

        return (
          <div 
            key={slot.index}
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center pointer-events-none"
            style={{
              transform: `translate(${xPos}px, ${yPos}px)`,
              zIndex: 10
            }}
          >
            <div className="absolute -top-8 text-center w-32 drop-shadow-md">
              <p className="text-white/40 tracking-[0.3em] text-[10px] uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                {slot.title}
              </p>
            </div>
            
            <div className="w-full h-full border border-white/10 rounded-xl flex items-center justify-center transition-colors duration-1000">
              {/* Empty slot marker */}
            </div>

            <div className="absolute top-[105%] text-center w-56 drop-shadow-md z-50">
              {positionedCard?.isRevealed && (
                <div className="animate-in fade-in duration-1000 pointer-events-auto mt-2">
                  <p className="text-white/90 font-serif text-sm leading-tight mb-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {positionedCard.card.name}
                  </p>
                  {positionedCard.orientation === 'reversed' && (
                    <p className="text-white/50 text-[9px] uppercase tracking-[0.2em] mb-2 font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                      Reversed
                    </p>
                  )}
                  <p className="text-white/70 text-xs leading-relaxed mt-2 max-w-[200px] mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {positionedCard.orientation === 'reversed' ? positionedCard.card.reversedMeaning : positionedCard.card.uprightMeaning}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
