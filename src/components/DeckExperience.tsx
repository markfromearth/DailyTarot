import { ShuffleControl } from "./ShuffleControl";
import { ReadingGuidance } from "./ReadingGuidance";
import { ReadingSlots } from "./ReadingSlots";
import React, { useState, useEffect } from 'react';
import { TarotCardView } from './TarotCardView';
import { ReadingPhase } from '../types/tarot';
import { TarotCard, PositionedCard } from '../types/tarot';

interface DeckExperienceProps {
  phase: ReadingPhase;
  initialDeckOrder: TarotCard[];
  selectedCards: PositionedCard[];
  onStartShuffle: () => void;
  onSelectCard: (cardId: string) => void;
  onFlipCard: (cardId: string) => void;
}

export const DeckExperience: React.FC<DeckExperienceProps> = ({ 
  phase, 
  initialDeckOrder,
  selectedCards,
  onStartShuffle,
  onSelectCard,
  onFlipCard
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter out the selected ones to determine fan positions for the remaining cards
  const selectedIds = new Set(selectedCards.map(c => c.card.id));
  const unselectedCards = initialDeckOrder.filter(c => !selectedIds.has(c.id));

  const getCardStyle = (cardId: string, originalIndex: number): React.CSSProperties => {
    const isShuffling = phase === 'shuffling';
    const isFan = phase === 'fan' || phase === 'place';
    const selectedIndex = selectedCards.findIndex(c => c.card.id === cardId);
    const isSelected = selectedIndex !== -1;
    
    // Base stacked position (intro)
    const baseTranslateX = (originalIndex % 3) * 0.5 - 0.75; 
    const baseTranslateY = -originalIndex * 0.2; 
    const baseRotate = (originalIndex % 5) * 0.4 - 0.8;
    
    if (isShuffling && !prefersReducedMotion) {
      return {
        transitionDelay: `${(originalIndex % 10) * 0.05}s`,
        zIndex: originalIndex,
        transform: `translate(${baseTranslateX}px, ${baseTranslateY}px) rotate(${baseRotate}deg)`,
      };
    }
    
    if (isSelected) {
      // Move to "placed" position at the top
      // We have 3 positions. We'll space them out horizontally.
      const cardWidth = viewportWidth < 768 ? 96 : 128;
      const spacing = viewportWidth < 768 ? 10 : 20;
      const totalWidth = (cardWidth * 3) + (spacing * 2);
      const startX = -(totalWidth / 2) + (cardWidth / 2);
      
      const xPos = startX + (selectedIndex * (cardWidth + spacing));
      const yPos = viewportWidth < 768 ? -220 : -280; 
      
      return {
        transform: `translate(${xPos}px, ${yPos}px) rotate(0deg) scale(1)`,
        transition: prefersReducedMotion ? 'none' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: 100 + selectedIndex,
      };
    }

    if (isFan) {
      const fanIndex = unselectedCards.findIndex(c => c.id === cardId);
      const totalUnselected = unselectedCards.length;
      
      const spreadWidth = Math.min(viewportWidth - 40, 800);
      const cardWidth = viewportWidth < 768 ? 96 : 128; // w-24 is 96px, w-32 is 128px
      const maxOffset = spreadWidth / 2 - cardWidth / 2;
      
      const normalizedIndex = totalUnselected > 1 ? fanIndex / (totalUnselected - 1) : 0.5; // 0 to 1
      let xPos = (normalizedIndex * 2 - 1) * maxOffset;
      let yPos = Math.abs(normalizedIndex - 0.5) * (viewportWidth < 768 ? 40 : 60) - 20; 
      let rotate = (normalizedIndex * 2 - 1) * (viewportWidth < 768 ? 20 : 30); 

      // Hover effects
      let scale = 1;
      let zIndex = originalIndex;

      if (hoveredId && !isSelected) {
        const hoveredFanIndex = unselectedCards.findIndex(c => c.id === hoveredId);
        const distance = fanIndex - hoveredFanIndex;
        
        if (distance === 0) {
          // The hovered card rises
          yPos -= 30;
          scale = 1.05;
          zIndex = 200; // Bring to front
        } else if (Math.abs(distance) < 4) {
          // Surrounding cards move aside slightly
          const pushAmount = (4 - Math.abs(distance)) * 4;
          xPos += distance > 0 ? pushAmount : -pushAmount;
        }
      }
      
      if (selectedCards.length === 3) {
        return {
          transform: `translate(${baseTranslateX}px, ${baseTranslateY}px) rotate(0deg) scale(0.9)`,
          transition: prefersReducedMotion ? 'none' : 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex,
        };
      }

      return {
        transform: `translate(${xPos}px, ${yPos}px) rotate(${rotate}deg) scale(${scale})`,
        transition: prefersReducedMotion ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        // No delay once in fan so hover feels responsive
        transitionDelay: phase === 'fan' && hoveredId === null ? '0s' : '0s', 
        zIndex,
      };
    }

    return {
      transform: `translate(${baseTranslateX}px, ${baseTranslateY}px) rotate(${baseRotate}deg)`,
      transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: originalIndex,
    };
  };

  const getCardClass = (originalIndex: number) => {
    if (phase !== 'shuffling' || prefersReducedMotion) return '';
    return originalIndex % 2 === 0 ? 'shuffle-right' : 'shuffle-left';
  };

  const handleCardClick = (cardId: string) => {
    if ((phase === 'fan' || phase === 'place') && selectedCards.length < 3) {
      if (!selectedIds.has(cardId)) {
        onSelectCard(cardId);
        setHoveredId(null);
      }
    } else if (phase === 'place' || phase === 'read') {
      const isSelected = selectedIds.has(cardId);
      const card = selectedCards.find(c => c.card.id === cardId);
      if (isSelected && card && !card.isRevealed) {
        onFlipCard(cardId);
      }
    }
  };

  return (
    <div className="relative w-full h-[700px] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Placed Cards Guidance */}
      <ReadingGuidance phase={phase} selectedCount={selectedCards.length} />

      {/* The Deck Container */}
      <div className="relative w-24 h-36 md:w-32 md:h-48 perspective-1000 mt-40">
        
        {/* Spread Slots matched to absolute math */}
        <ReadingSlots 
          phase={phase} 
          selectedCards={selectedCards} 
          viewportWidth={viewportWidth} 
        />
        
        {initialDeckOrder.map((card, index) => {
          const selectedCard = selectedCards.find(c => c.card.id === card.id);
          const isSelected = !!selectedCard;
          
          let isInteractable = false;
          if ((phase === 'fan' || phase === 'place') && !isSelected && selectedCards.length < 3) {
            isInteractable = true; // Can select from fan
          } else if ((phase === 'place' || phase === 'read') && isSelected && !selectedCard?.isRevealed) {
            isInteractable = true; // Can flip
          }
          
          return (
            <div
              key={card.id}
              className={`absolute top-0 left-0 w-full h-full transform-gpu ${getCardClass(index)} outline-none`}
              style={{
                ...getCardStyle(card.id, index),
              }}
              onMouseEnter={() => isInteractable && setHoveredId(card.id)}
              onMouseLeave={() => isInteractable && setHoveredId(null)}
              onFocus={() => isInteractable && setHoveredId(card.id)}
              onBlur={() => isInteractable && setHoveredId(null)}
              role={isInteractable ? 'button' : 'presentation'}
              tabIndex={isInteractable ? 0 : -1}
              aria-label={isInteractable ? 'Select Tarot Card' : undefined}
              onKeyDown={(e) => {
                if (isInteractable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleCardClick(card.id);
                }
              }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Focus ring for accessibility */}
              {isInteractable && hoveredId === card.id && (
                <div className="absolute -inset-1 rounded-xl border-2 border-white/50 z-50 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
              )}
              <TarotCardView 
                card={card}
                orientation={selectedCard?.orientation || 'upright'}
                isFlipped={selectedCard?.isRevealed || false}
                className={isInteractable ? 'cursor-pointer pointer-events-none' : 'pointer-events-none'}
              />
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <ShuffleControl phase={phase} onStartShuffle={onStartShuffle} />
    </div>
  );
};
