import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RitualAudio } from './sound';

describe('RitualAudio', () => {
  let audio: RitualAudio;

  beforeEach(() => {
    audio = new RitualAudio();
  });

  it('safely handles environments where AudioContext is undefined without throwing', () => {
    expect(() => audio.playCardSelect()).not.toThrow();
    expect(() => audio.playShuffleChime()).not.toThrow();
  });

  it('synthesizes card flick and peel sound when Web Audio is available', () => {
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOsc = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockFilter = {
      type: '',
      Q: { setValueAtTime: vi.fn() },
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockBufferSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockChannelData = new Float32Array(100);
    const mockAudioContext = {
      currentTime: 0,
      state: 'running',
      sampleRate: 44100,
      destination: {},
      createOscillator: vi.fn(() => mockOsc),
      createGain: vi.fn(() => mockGain),
      createBiquadFilter: vi.fn(() => mockFilter),
      createBufferSource: vi.fn(() => mockBufferSource),
      createBuffer: vi.fn(() => ({
        sampleRate: 44100,
        getChannelData: vi.fn(() => mockChannelData),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => mockAudioContext);

    const testAudio = new RitualAudio();
    expect(() => testAudio.playCardSelect()).not.toThrow();

    // Verifies the card flick snap oscillator and body thud were created
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    // Verifies the paper friction bandpass filter was created
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    // Verifies audio buffer source was used for the card slide whoosh
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
  });
});
