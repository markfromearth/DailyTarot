import { PersistedReading } from '../types/tarot';

const STORAGE_KEY = 'daily_tarot_reading_v2';

export const ReadingPersistence = {
  getTodayDateString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  },

  saveReading(reading: PersistedReading): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reading));
    } catch (e) {
      console.error("Failed to save reading to local storage", e);
    }
  },

  getReading(): PersistedReading | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Basic schema validation
      if (
        !parsed || 
        parsed.version !== 1 || 
        !parsed.date || 
        !Array.isArray(parsed.availableCardIds) ||
        !Array.isArray(parsed.drawnCardsData) ||
        !Array.isArray(parsed.initialShuffledDeckIds) ||
        !Array.isArray(parsed.selectedCardsData)
      ) {
        throw new Error("Invalid persistence schema");
      }
      
      return parsed as PersistedReading;
    } catch (e) {
      console.warn("Failed to parse or validate stored reading. Clearing state.", e);
      this.clearReading();
      return null;
    }
  },

  getTodaysReading(): PersistedReading | null {
    const reading = this.getReading();
    if (!reading) return null;

    const today = this.getTodayDateString();
    if (reading.date === today) {
      return reading;
    }

    // It's a new day, clear old reading
    this.clearReading();
    return null;
  },

  clearReading(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
