import { SpeedInsights } from '@vercel/speed-insights/react';
import { useReading } from './hooks/useReading';
import { DeckExperience } from './components/DeckExperience';

function App() {
  const {
    phase,
    beginShuffle,
    initialDeckOrder,
    selectedCards,
    selectCardFromFan,
    flipCard,
    resetReading,
    error,
    clearError,
  } = useReading();

  const isOrbitPhase = phase === 'intro' || phase === 'shuffling';

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Accessible Live Region for Screen Readers & Status Announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {error || `Reading ritual phase: ${phase}`}
      </div>

      {/* Visual Non-Intrusive Error Notification */}
      {error && (
        <div
          role="alert"
          className="fixed top-20 z-50 px-4 py-2 bg-red-950/80 border border-red-500/40 rounded-full text-red-200 text-xs md:text-sm backdrop-blur-md flex items-center gap-3"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-300 hover:text-white text-xs underline font-sans ml-1 cursor-pointer"
            aria-label="Dismiss error notification"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Vercel Speed Insights Web Vitals Telemetry */}
      <SpeedInsights />
    </div>
  );
}

export default App;
