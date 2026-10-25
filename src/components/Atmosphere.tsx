import React, { useEffect, useState } from 'react';
import { ReadingPhase } from '../types/tarot';

interface AtmosphereProps {
  phase: ReadingPhase;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({ phase }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const getPhaseStyles = (): React.CSSProperties => {
    const baseTransition = prefersReducedMotion ? 'none' : 'all 2s ease-in-out';
    
    switch (phase) {
      case 'intro':
        return {
          transform: 'scale(1)',
          filter: 'brightness(1) contrast(1)',
          transition: baseTransition
        };
      case 'shuffling':
        return {
          transform: prefersReducedMotion ? 'scale(1)' : 'scale(1.03)',
          filter: 'brightness(0.9) contrast(1.1)',
          transition: baseTransition
        };
      case 'fan':
        return {
          transform: prefersReducedMotion ? 'scale(1)' : 'scale(1.01)',
          filter: 'brightness(0.85) contrast(1.05)',
          transition: baseTransition
        };
      case 'place':
        return {
          transform: 'scale(1)',
          filter: 'brightness(0.7) contrast(1.1)',
          transition: baseTransition
        };
      case 'read':
        return {
          transform: 'scale(1)',
          filter: 'brightness(0.5) contrast(1.15)',
          transition: baseTransition
        };
      default:
        return {
          transform: 'scale(1)',
          filter: 'brightness(1)',
          transition: baseTransition
        };
    }
  };

  const getOverlayOpacity = () => {
    switch (phase) {
      case 'intro': return 'opacity-0';
      case 'shuffling': return 'opacity-20';
      case 'fan': return 'opacity-30';
      case 'place': return 'opacity-50';
      case 'read': return 'opacity-70';
      default: return 'opacity-0';
    }
  };

  const getRadialGlowOpacity = () => {
    switch (phase) {
      case 'place': return 'opacity-40';
      case 'read': return 'opacity-60';
      default: return 'opacity-0';
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-slate-900">
      
      {/* Dynamic Background Image */}
      <picture>
        <source media="(min-width: 768px)" srcSet="/bg-desktop.jpg" />
        <img 
          src="/bg.jpg" 
          alt="" 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover origin-center"
          style={getPhaseStyles()}
        />
      </picture>

      {/* Dimming Overlay for readability */}
      <div 
        className={`absolute inset-0 bg-slate-950 transition-opacity duration-[2000ms] ease-in-out ${getOverlayOpacity()}`}
      />

      {/* Subtle Radial Glow in the reading area (center) */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-900/30 blur-[100px] transition-opacity duration-[2000ms] ease-in-out mix-blend-screen ${getRadialGlowOpacity()}`}
      />
    </div>
  );
};
