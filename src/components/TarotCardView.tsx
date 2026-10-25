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

const getRomanNumeral = (num?: number): string => {
  if (num === 0) return '0';
  if (!num) return '';
  const roman = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
    11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
    16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI'
  };
  return roman[num as keyof typeof roman] || num.toString();
};

const getSuitSymbol = (suit?: string | null): string => {
  switch (suit) {
    case 'wands': return '✧'; // Spark / energy
    case 'cups': return '▿'; // Vessel / water
    case 'swords': return '⌖'; // Focus / air / blade
    case 'pentacles': return '◇'; // Earth / crystal
    default: return '✦';
  }
};

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
      role={onClick ? 'button' : 'img'}
      aria-label={`${card.name}${isReversed ? ' (Reversed)' : ''}`}
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
              // Refined Fallback System
              <div className="w-full h-full p-3 bg-gradient-to-b from-[#111827] to-[#0f172a] flex flex-col">
                <div className="flex-1 w-full border border-[#334155] rounded-lg flex flex-col items-center justify-between p-3 relative overflow-hidden">
                  
                  {/* Subtle Background Motif */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <span className="text-8xl font-serif">
                      {card.arcana === 'major' ? '✦' : getSuitSymbol(card.suit)}
                    </span>
                  </div>

                  {/* Top: Number / Arcana Indicator */}
                  <div className="text-[#64748b] text-[10px] font-serif tracking-widest uppercase">
                    {card.arcana === 'major' ? getRomanNumeral(card.number) : getSuitSymbol(card.suit)}
                  </div>

                  {/* Middle: Title */}
                  <div className="flex flex-col items-center justify-center z-10 text-center w-full">
                    <h3 className="text-[#fbbf24] text-xs md:text-sm font-serif tracking-[0.2em] leading-snug drop-shadow-md">
                      {card.name.toUpperCase()}
                    </h3>
                  </div>

                  {/* Bottom: Rank / Arcana Indicator */}
                  <div className="text-[#64748b] text-[10px] font-serif tracking-widest uppercase transform rotate-180">
                    {card.arcana === 'major' ? getRomanNumeral(card.number) : getSuitSymbol(card.suit)}
                  </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
