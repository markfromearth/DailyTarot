import React from 'react';

interface CardBackProps {
  className?: string;
}

export const CardBack: React.FC<CardBackProps> = ({ className = '' }) => {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`w-full h-full bg-[#191817] bg-[url('/cards/card_back.png')] bg-cover bg-center select-none pointer-events-none relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Subtle metallic gold/champagne sheen on hover/tilt */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            'linear-gradient(130deg, transparent 32%, rgba(235, 215, 165, 0.55) 49%, rgba(255, 250, 235, 0.4) 51%, transparent 68%)',
        }}
      />
    </div>
  );
};
