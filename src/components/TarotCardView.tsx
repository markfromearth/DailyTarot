import React from 'react';
import { CardBack } from './CardBack';
import { TarotCard, Orientation } from '../types/tarot';

interface TarotCardViewProps {
  card: TarotCard;
  orientation?: Orientation; // Optional for when it's just front-facing in a gallery, etc.
  isFlipped: boolean;
  className?: string;
  onClick?: () => void;
  // This allows the artwork specification to be injected later via CSS or src
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
      className={`relative w-full h-full perspective-1000 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Card Back (Face Down) */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <CardBack />
        </div>

        {/* Card Front (Face Up) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 overflow-hidden rounded-xl border border-slate-600 bg-slate-800 shadow-xl flex flex-col">
          
          {/* Inner Frame for Artwork */}
          <div className="flex-1 relative m-2 border border-slate-600 rounded overflow-hidden flex items-center justify-center bg-slate-900">
            {/* 
              The actual artwork. 
              If the user supplies an artwork specification, it integrates here.
              The rotation applies to the artwork/inner frame to represent upright/reversed.
            */}
            <div 
              className={`w-full h-full transition-transform duration-500 flex items-center justify-center ${isReversed ? 'rotate-180' : ''}`}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={card.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              ) : (
                // Placeholder if no artwork is supplied yet
                <div className="text-slate-600 text-6xl font-serif opacity-30">
                  {card.arcana === 'major' ? 'I' : card.suit?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Card Label / Footer */}
          <div className="h-12 w-full bg-slate-800 flex items-center justify-center border-t border-slate-700 px-2 shrink-0">
            <h3 className="text-amber-500/90 text-xs md:text-sm font-serif tracking-widest text-center truncate">
              {card.name}
            </h3>
          </div>
          
          {/* Optional: Reversed Indicator in Label */}
          {isReversed && (
            <div className="absolute top-4 w-full flex justify-center">
              <span className="bg-slate-900/80 text-slate-400 text-[9px] uppercase tracking-widest px-2 py-1 rounded backdrop-blur">
                Reversed
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
