import { Reading } from '../types/tarot';

const STORAGE_KEY = 'daily_tarot_reading';

export const ReadingPersistence = {
  getTodayDateString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  },

  saveReading(reading: Reading): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reading));
    } catch (e) {
      console.error("Failed to save reading to local storage", e);
    }
  },

  getReading(): Reading | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as Reading;
    } catch (e) {
      console.error("Failed to parse stored reading", e);
      return null;
    }
  },

  getTodaysReading(): Reading | null {
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
