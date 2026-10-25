import { useState, useEffect } from 'react';

export function useMouseParallax(intensity: number = 20) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let requestRef: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized position between -1 and 1
      const xPos = (clientX / innerWidth - 0.5) * 2;
      const yPos = (clientY / innerHeight - 0.5) * 2;
      
      // We negate the values so the background moves *opposite* to the mouse
      // which creates the illusion of depth.
      cancelAnimationFrame(requestRef);
      requestRef = requestAnimationFrame(() => {
        setOffset({
          x: xPos * -intensity,
          y: yPos * -intensity
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef);
    };
  }, [intensity]);

  return offset;
}
