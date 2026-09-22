import { useReading } from './hooks/useReading';
import { DeckExperience } from './components/DeckExperience';

function App() {
  const { phase, beginShuffle, initialDeckOrder, selectedCards, selectCardFromFan, flipCard, resetReading } = useReading();

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 pt-12 overflow-y-auto overflow-x-hidden relative">
      {/* Header */}
      <div className={`text-center transition-all duration-1000 z-50 ${phase === 'intro' ? 'mb-12' : 'mb-6'}`}>
        <h1 className="text-3xl md:text-4xl font-normal tracking-[0.3em] uppercase text-white/90 font-serif" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          Daily Tarot
        </h1>
        {phase === 'intro' && (
          <p className="text-white/60 mt-6 max-w-md mx-auto tracking-widest text-xs uppercase leading-loose" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            A quiet ritual to center your thoughts
          </p>
        )}
      </div>

      {/* Main Experience Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative">
        <DeckExperience 
          phase={phase}
          initialDeckOrder={initialDeckOrder}
          selectedCards={selectedCards}
          onStartShuffle={beginShuffle}
          onSelectCard={selectCardFromFan}
          onFlipCard={flipCard}
        />
      </main>
      
      {phase === 'read' && (
        <div className="mt-8 mb-24 text-center animate-in fade-in duration-1000 z-50">
          <button 
            onClick={resetReading}
            className="text-white/40 tracking-[0.2em] text-xs uppercase hover:text-white/80 transition-colors"
          >
            Clear and restart
          </button>
        </div>
      )}
      
      {/* Footer / Info */}
      <footer className="mt-8 text-center text-xs text-slate-300 tracking-wider font-medium z-50" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
        Create a sacred space.
      </footer>
    </div>
  );
}

export default App;
