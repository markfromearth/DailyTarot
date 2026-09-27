import React from 'react';
import { CardBack } from './CardBack';
import { TarotCard, Orientation } from '../types/tarot';

interface TarotCardViewProps {
  card: TarotCard;
  orientation?: Orientation;
  isFlipped: boolean;
  className?: string;
  onClick?: () => void;
  imageUrl?: string;
}

export const TarotCardView: React.FC<TarotCardViewProps> = ({
  card,
  orientation = 'upright',
  isFlipped,
  className = '',
  onClick,
  imageUrl = card.imageUrl
}) => {
  const isReversed = orientation === 'reversed';

  return (
    <div 
      className={`relative w-full h-full perspective-1000 ${className}`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Card Back (Face Down) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden shadow-xl shadow-black/60 bg-[#0a0f1d] border border-white/10">
          <CardBack />
        </div>

        {/* Card Front (Face Up) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-xl shadow-black/60 bg-[#0a0f1d] border border-white/10">
          <div className={`w-full h-full transition-transform duration-500 ${isReversed ? 'rotate-180' : ''}`}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={card.imageAltText || card.name} 
                className="w-full h-full object-cover" 
                loading="lazy"
                decoding="async"
              />
            ) : (
              // Clean fallback state when artwork is missing
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-800 to-slate-900">
                <div className="flex-1 w-full border border-slate-600/50 rounded flex flex-col items-center justify-center relative p-2 text-center">
                  <div className="text-slate-500/30 text-5xl font-serif absolute opacity-50">
                    {card.arcana === 'major' ? card.number : card.suit?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-amber-500/80 text-[10px] md:text-xs font-serif tracking-widest z-10 drop-shadow-md leading-tight">
                    {card.name.toUpperCase()}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
