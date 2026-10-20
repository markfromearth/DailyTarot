import React from 'react';
import { ReadingPhase } from '../types/tarot';

interface ShuffleControlProps {
  phase: ReadingPhase;
  onStartShuffle: () => void;
  onResetReading?: () => void;
  swirlProgress?: number; // 0 to 1
}

export const ShuffleControl: React.FC<ShuffleControlProps> = ({
  phase,
  onStartShuffle,
  onResetReading,
  swirlProgress = 0,
}) => {
  if (phase !== 'intro' && phase !== 'shuffling' && phase !== 'fan' && phase !== 'read') {
    return null;
  }

  const progressPercent = Math.min(100, Math.round(swirlProgress * 100));
  const label =
    phase === 'shuffling'
      ? 'SWIRLING...'
      : phase === 'fan'
        ? 'RESHUFFLE DECK'
        : phase === 'read'
          ? 'CLEAR & RESTART'
          : 'SWIPE TO SHUFFLE';

  const handleClick = () => {
    if ((phase === 'fan' || phase === 'read') && onResetReading) {
      onResetReading();
    } else {
      onStartShuffle();
    }
  };

  return (
    <div className="fixed bottom-12 right-10 md:bottom-20 md:right-24 z-50 flex flex-col items-end pointer-events-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={phase === 'shuffling'}
        aria-label={
          phase === 'fan'
            ? 'Reshuffle the deck'
            : phase === 'read'
              ? 'Clear and restart'
              : 'Shuffle the deck'
        }
        className="group bg-transparent border-none outline-none cursor-pointer disabled:cursor-default text-right transition-opacity duration-500 flex items-center gap-2.5"
      >
        {(phase === 'fan' || phase === 'read') && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4 md:w-5 md:h-5 text-[#f6c863]/80 group-hover:text-[#f6c863] group-hover:rotate-180 transition-all duration-500"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        )}
        <span
          className="block text-[#f1f5f9] group-hover:text-[#f6c863] tracking-[0.18em] uppercase text-sm md:text-xl font-light transition-all duration-300"
          style={{
            fontFamily: "'Optima', 'Cinzel', 'Didot', 'Bodoni MT', 'Times New Roman', serif",
            textShadow: '0 0 18px rgba(255, 255, 255, 0.35), 0 2px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          {label}
        </span>
      </button>

      {/* Subtle Golden Comet Progress Underline when Swirling */}
      {phase === 'intro' && (
        <div
          className="w-40 md:w-52 h-[1.5px] bg-white/10 rounded-full overflow-hidden mt-2 transition-opacity duration-200 pointer-events-none"
          style={{
            opacity: swirlProgress > 0.02 ? '1' : 'var(--swirl-opacity, 0)',
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-transparent via-[#f6c863] to-white transition-all duration-75"
            style={{
              width: swirlProgress > 0 ? `${progressPercent}%` : 'var(--swirl-progress, 0%)',
            }}
          />
        </div>
      )}
    </div>
  );
};
