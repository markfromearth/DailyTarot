import React from 'react';
import { useMouseParallax } from '../hooks/useMouseParallax';

export const ParallaxBackground: React.FC = () => {
  const { x, y } = useMouseParallax(20);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900 pointer-events-none">
      <div 
        className="absolute inset-0 w-full h-full transform-gpu ease-out"
        style={{
          transform: `scale(1.05) translate3d(${x}px, ${y}px, 0)`,
          transition: 'transform 100ms cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet="/bg-desktop.jpg" />
          <img 
            src="/bg.jpg" 
            alt="Mystical Landscape" 
            className="w-full h-full object-cover opacity-90"
          />
        </picture>
        {/* Subtle dark vignette */}
        <div className="absolute inset-0 bg-black/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
      </div>
    </div>
  );
};
