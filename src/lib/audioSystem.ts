import { log } from './log';
import { getCelebrationSettings } from './storage';

// Audio file definitions for different celebration types
export const CELEBRATION_SOUNDS = {
  // Task completion sounds
  'big-three': '/sounds/trophy-bell.mp3',
  'task-complete': '/sounds/task-chime.mp3',
  'habit-complete': '/sounds/soft-success.mp3',
  
  // Pomodoro sounds
  'pomodoro-complete': '/sounds/focus-complete.mp3',
  'break-start': '/sounds/break-chime.mp3',
  
  // General celebration
  'celebration': '/sounds/celebration-chime.mp3',
  'micro-win': '/sounds/micro-win.mp3',
} as const;

export type SoundType = keyof typeof CELEBRATION_SOUNDS;

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: boolean;
  respectSettings?: boolean;
}

class AudioSystem {
  private audioCache = new Map<string, HTMLAudioElement>();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Pre-load common celebration sounds for instant playback
      const commonSounds: SoundType[] = ['task-complete', 'pomodoro-complete', 'celebration'];
      
      await Promise.allSettled(
        commonSounds.map(soundType => this.preloadSound(soundType))
      );
      
      this.isInitialized = true;
      log.info('Audio system initialized successfully');
    } catch (error) {
      log.warn('Audio system initialization failed:', error);
      // Continue without audio rather than breaking the app
    }
  }

  private async preloadSound(soundType: SoundType): Promise<void> {
    const url = CELEBRATION_SOUNDS[soundType];
    
    try {
      const audio = new Audio(url);
      
      // Set up audio element
      audio.preload = 'auto';
      audio.volume = 0.6; // Default volume
      
      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = (e: Event) => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error(`Failed to load sound: ${url}`));
        };
        
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        
        // Start loading
        audio.load();
      });
      
      this.audioCache.set(soundType, audio);
      log.debug(`Preloaded sound: ${soundType}`);
    } catch (error) {
      log.warn(`Failed to preload sound ${soundType}:`, error);
      // Continue without this sound
    }
  }

  async playSound(soundType: SoundType, options: AudioOptions = {}): Promise<void> {
    const {
      volume = 0.6,
      loop = false,
      fadeIn = false,
      respectSettings = true
    } = options;

    // Check if sound is enabled in settings
    if (respectSettings) {
      const settings = getCelebrationSettings();
      if (!settings.soundEnabled || !settings.enabled) {
        log.debug(`Sound disabled in settings: ${soundType}`);
        return;
      }
    }

    try {
      let audio = this.audioCache.get(soundType);
      
      if (!audio) {
        // Create audio on-demand if not preloaded
        const url = CELEBRATION_SOUNDS[soundType];
        audio = new Audio(url);
        audio.preload = 'auto';
        this.audioCache.set(soundType, audio);
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      audio.loop = loop;
      audio.volume = fadeIn ? 0 : volume;

      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise) {
        await playPromise;
        
        // Handle fade-in effect
        if (fadeIn) {
          this.fadeInAudio(audio, volume, 300);
        }
        
        log.debug(`Played sound: ${soundType}`);
      }
    } catch (error) {
      // Audio play failed - this is common if user hasn't interacted with page yet
      log.debug(`Audio play failed for ${soundType}:`, error);
      // Don't throw error - audio failure shouldn't break app functionality
    }
  }

  private fadeInAudio(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  // Convenience methods for common celebrations
  async playTaskComplete(taskType: 'big-three' | 'regular' | 'habit' = 'regular'): Promise<void> {
    const soundMap: Record<typeof taskType, SoundType> = {
      'big-three': 'big-three',
      'regular': 'task-complete',
      'habit': 'habit-complete'
    };
    
    await this.playSound(soundMap[taskType]);
  }

  async playPomodoroComplete(): Promise<void> {
    await this.playSound('pomodoro-complete', { volume: 0.7 });
  }

  async playMicroWin(): Promise<void> {
    await this.playSound('micro-win', { volume: 0.5 });
  }

  async playCelebration(): Promise<void> {
    await this.playSound('celebration');
  }

  // Check if sound is available
  isSoundAvailable(soundType: SoundType): boolean {
    const audio = this.audioCache.get(soundType);
    return audio?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
  }

  // Get current settings
  getSoundSettings() {
    const settings = getCelebrationSettings();
    return {
      enabled: settings.soundEnabled && settings.enabled,
      volume: 0.6 // Could be made configurable
    };
  }

  // Cleanup method
  dispose(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const audioSystem = new AudioSystem();

// Initialize audio system when the module loads
if (typeof window !== 'undefined') {
  // Initialize after a short delay to allow page to settle
  setTimeout(() => {
    audioSystem.initialize();
  }, 1000);
}