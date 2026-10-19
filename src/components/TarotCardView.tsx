import React from 'react';
import { CardBack } from './CardBack';
import { EyvindEarleCardArt } from './EyvindEarleCardArt';
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
  imageUrl
}) => {
  const isReversed = orientation === 'reversed';
  const [imageError, setImageError] = React.useState(false);

  return (
    <div 
      className={`relative w-full h-full perspective-1000 ${className}`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-[850ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Card Back (Face Down) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden tarot-card-shell">
          <div className="w-full h-full rounded-[10px] overflow-hidden">
            <CardBack />
          </div>
        </div>

        {/* Card Front (Face Up — Eyvind Earle Style) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden tarot-card-shell">
          <div className={`w-full h-full rounded-[10px] overflow-hidden bg-[#060919] transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${isReversed ? 'rotate-180' : ''}`}>
            {imageUrl && !imageError ? (
              <div className="w-full h-full relative">
                <img 
                  src={imageUrl} 
                  alt={card.imageAltText || card.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <EyvindEarleCardArt card={card} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
