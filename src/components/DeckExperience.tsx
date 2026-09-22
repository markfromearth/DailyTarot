import React, { useState, useEffect } from 'react';
import { TarotCardView } from './TarotCardView';
import { ReadingPhase } from '../hooks/useReading';
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
      {(phase === 'fan' || phase === 'place') && selectedCards.length < 3 && (
        <div className="absolute top-8 text-center z-50 drop-shadow-lg transition-opacity duration-700">
          <p className="text-white/60 tracking-[0.2em] text-xs uppercase mb-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {['Choose your first card', 'Choose your second card', 'Choose your third card'][selectedCards.length]}
          </p>
          <p className="text-white/90 tracking-[0.3em] text-sm uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {['PAST', 'PRESENT', 'FUTURE'][selectedCards.length]}
          </p>
        </div>
      )}


      {/* The Deck Container */}
      <div className="relative w-24 h-36 md:w-32 md:h-48 perspective-1000 mt-40">
        
        {/* Spread Slots matched to absolute math */}
        {(phase === 'fan' || phase === 'place' || phase === 'read') && [
          { title: 'PAST', index: 0 },
          { title: 'PRESENT', index: 1 },
          { title: 'FUTURE', index: 2 }
        ].map((slot) => {
          const cardWidth = viewportWidth < 768 ? 96 : 128;
          const spacing = viewportWidth < 768 ? 10 : 20;
          const totalWidth = (cardWidth * 3) + (spacing * 2);
          const startX = -(totalWidth / 2) + (cardWidth / 2);
          const xPos = startX + (slot.index * (cardWidth + spacing));
          const yPos = viewportWidth < 768 ? -220 : -280; // slightly higher
          
          return (
            <div 
              key={slot.index}
              className="absolute top-0 left-0 w-full h-full flex flex-col items-center pointer-events-none"
              style={{
                transform: `translate(${xPos}px, ${yPos}px)`,
                zIndex: 10
              }}
            >
              <div className="absolute -top-8 text-center w-32 drop-shadow-md">
                <p className="text-white/40 tracking-[0.3em] text-[10px] uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>{slot.title}</p>
              </div>
              
              <div className="w-full h-full border border-white/10 rounded-xl flex items-center justify-center transition-colors duration-1000">
                {/* Empty slot marker */}
              </div>

              <div className="absolute top-[105%] text-center w-56 drop-shadow-md z-50">
                {(() => {
                  const positionedCard = selectedCards[slot.index];
                  if (positionedCard?.isRevealed) {
                    const isReversed = positionedCard.orientation === 'reversed';
                    const meaning = isReversed ? positionedCard.card.reversedMeaning : positionedCard.card.uprightMeaning;
                    return (
                      <div className="animate-in fade-in duration-1000 pointer-events-auto mt-2">
                        <p className="text-white/90 font-serif text-sm leading-tight mb-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{positionedCard.card.name}</p>
                        {isReversed && <p className="text-white/50 text-[9px] uppercase tracking-[0.2em] mb-2 font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>Reversed</p>}
                        <p className="text-white/70 text-xs leading-relaxed mt-2 max-w-[200px] mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{meaning}</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          );
        })}
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
      {phase === 'intro' && (
        <button 
          onClick={onStartShuffle}
          className="absolute bottom-16 px-8 py-3 bg-transparent text-white/80 rounded-full tracking-[0.2em] uppercase text-xs border border-white/20 hover:border-white/50 hover:text-white transition-all duration-500 z-50 backdrop-blur-sm"
        >
          Shuffle the deck
        </button>
      )}
      
      {phase === 'shuffling' && (
        <div className="absolute bottom-16 text-white/50 tracking-[0.3em] text-[10px] uppercase animate-pulse z-50" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
          Focus your intention
        </div>
      )}

      {/* Completion state */}
      {selectedCards.length === 3 && phase !== 'read' && (
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
    </div>
  );
};
