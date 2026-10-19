import { useReading } from './hooks/useReading';
import { DeckExperience } from './components/DeckExperience';

function App() {
  const { phase, beginShuffle, initialDeckOrder, selectedCards, selectCardFromFan, flipCard, resetReading } = useReading();

  const isOrbitPhase = phase === 'intro' || phase === 'shuffling';

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Subtle Top Header only during Fan / Place / Read phases so the Intro Void stays pure */}
      {!isOrbitPhase && (
        <div className="fixed top-6 left-0 right-0 text-center transition-opacity duration-1000 z-50 pointer-events-none">
          <h1
            className="text-xl md:text-2xl font-light tracking-[0.35em] uppercase text-white/80 font-serif"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
          >
            Daily Tarot
          </h1>
        </div>
      )}

      {/* Main 3D Experience Area */}
      <main className="w-full h-screen flex flex-col items-center justify-center relative">
        <DeckExperience 
          phase={phase}
          initialDeckOrder={initialDeckOrder}
          selectedCards={selectedCards}
          onStartShuffle={beginShuffle}
          onSelectCard={selectCardFromFan}
          onFlipCard={flipCard}
          onResetReading={resetReading}
        />
      </main>
    </div>
  );
}

export default App;
