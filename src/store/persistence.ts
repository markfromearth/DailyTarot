import { PersistedReading } from '../types/tarot';
import { PersistedReadingSchema } from './persistence.schema';

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
      console.error('Failed to save reading to local storage', e);
    }
  },

  getReading(): PersistedReading | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      let parsed: unknown;
      try {
        parsed = JSON.parse(stored);
      } catch (parseErr) {
        console.warn('Failed to parse stored reading JSON. Clearing state.', parseErr);
        this.clearReading();
        return null;
      }

      const result = PersistedReadingSchema.safeParse(parsed);
      if (!result.success) {
        console.warn(
          'Failed to validate stored reading against schema. Clearing state.',
          result.error
        );
        this.clearReading();
        return null;
      }

      return result.data as PersistedReading;
    } catch (e) {
      console.warn('Failed to read stored reading. Clearing state.', e);
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear reading from local storage', e);
    }
  },
};
