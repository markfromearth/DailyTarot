import React from 'react';

interface CardBackProps {
  className?: string;
}

export const CardBack: React.FC<CardBackProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${className}`}>
      <img 
        src="/cards/card_back.jpg" 
        alt="Tarot Card Back" 
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
};
