// Safe audio utilities for soundscapes

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  isPlaying: boolean;
  volume: number;
}

export class AudioManager {
  private tracks = new Map<string, HTMLAudioElement>();
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Create a dummy audio context to test browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioContext.close();
      this.isInitialized = true;
      return true;
    } catch {
      return false;
    }
  }

  loadTrack(id: string, url: string): HTMLAudioElement | null {
    if (!this.isInitialized) return null;

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.preload = 'metadata';
      this.tracks.set(id, audio);
      return audio;
    } catch {
      return null;
    }
  }

  async playTrack(id: string, volume = 0.5): Promise<boolean> {
    const audio = this.tracks.get(id);
    if (!audio) return false;

    try {
      audio.volume = Math.max(0, Math.min(1, volume));
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  stopTrack(id: string): boolean {
    const audio = this.tracks.get(id);
    if (!audio) return false;

    try {
      audio.pause();
      audio.currentTime = 0;
      return true;
    } catch {
      return false;
    }
  }

  setVolume(id: string, volume: number): boolean {
    const audio = this.tracks.get(id);
    if (!audio) return false;

    try {
      audio.volume = Math.max(0, Math.min(1, volume));
      return true;
    } catch {
      return false;
    }
  }

  isPlaying(id: string): boolean {
    const audio = this.tracks.get(id);
    return audio ? !audio.paused : false;
  }

  cleanup(): void {
    this.tracks.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.tracks.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Default soundscapes
export const SOUNDSCAPES = [
  { id: 'rain', name: '🌧️ Rain', url: '/audio/rain.mp3' },
  { id: 'cafe', name: '☕ Café', url: '/audio/cafe.mp3' },
  { id: 'fireplace', name: '🔥 Fireplace', url: '/audio/fireplace.mp3' },
  { id: 'ocean', name: '🌊 Ocean', url: '/audio/ocean.mp3' },
  { id: 'birds', name: '🐦 Birds', url: '/audio/birds.mp3' },
  { id: 'lofi', name: '🎵 Lo-Fi', url: '/audio/lofi.mp3' },
];