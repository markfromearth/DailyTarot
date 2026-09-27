import React from 'react';
import { ReadingPhase } from '../types/tarot';

interface ShuffleControlProps {
  phase: ReadingPhase;
  onStartShuffle: () => void;
}

export const ShuffleControl: React.FC<ShuffleControlProps> = ({ phase, onStartShuffle }) => {
  if (phase !== 'intro') return null;

  return (
    <button 
      onClick={onStartShuffle}
      className="absolute bottom-16 px-8 py-3 bg-transparent text-white/80 rounded-full tracking-[0.2em] uppercase text-xs border border-white/20 hover:border-white/50 hover:text-white transition-all duration-500 z-50 backdrop-blur-sm"
    >
      Shuffle the deck
    </button>
  );
};
