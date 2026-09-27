import React from 'react';
import { ReadingPhase } from '../types/tarot';

interface ReadingGuidanceProps {
  phase: ReadingPhase;
  selectedCount: number;
}

export const ReadingGuidance: React.FC<ReadingGuidanceProps> = ({ phase, selectedCount }) => {
  return (
    <>
      {phase === 'shuffling' && (
        <div className="absolute bottom-16 text-white/50 tracking-[0.3em] text-[10px] uppercase animate-pulse z-50" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
          Focus your intention
        </div>
      )}

      {(phase === 'fan' || phase === 'place') && selectedCount < 3 && (
        <div className="absolute top-8 text-center z-50 drop-shadow-lg transition-opacity duration-700">
          <p className="text-white/60 tracking-[0.2em] text-xs uppercase mb-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {['Choose your first card', 'Choose your second card', 'Choose your third card'][selectedCount]}
          </p>
          <p className="text-white/90 tracking-[0.3em] text-sm uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {['PAST', 'PRESENT', 'FUTURE'][selectedCount]}
          </p>
        </div>
      )}

      {selectedCount === 3 && phase !== 'read' && (
        <div 
          className="absolute bottom-12 flex flex-col items-center z-50 transition-opacity duration-1000 delay-1000"
          style={{ animation: 'fadeIn 1s ease-out 0.8s forwards', opacity: 0 }}
        >
          <p className="text-white/60 tracking-[0.2em] text-xs uppercase mb-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            Your three cards have been chosen
          </p>
          <p className="text-white/90 tracking-[0.3em] text-sm uppercase" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            Tap a card to reveal
          </p>
        </div>
      )}
    </>
  );
};
