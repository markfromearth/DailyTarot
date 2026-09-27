import React from 'react';

interface CardBackProps {
  className?: string;
}

export const CardBack: React.FC<CardBackProps> = ({ className = '' }) => {
  return (
    <img 
      src="/cards/card_back.jpg" 
      alt="Tarot Card Back" 
      className={`w-full h-full object-cover ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};
