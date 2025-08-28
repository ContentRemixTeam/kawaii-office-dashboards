import { toLocalISODate } from "@/lib/localDate";
import { safeStorage } from "./safeStorage";
import { awardTrophy } from "./trophySystem";
import { eventBus } from "./eventBus";
import { log } from "./log";

// Data model for localStorage
export type FocusPhase = "focus" | "short" | "long" | "idle";
export type SoundType = "chime" | "bell" | "off";
export type WorkflowType = "classic" | "deep" | "sprint" | "custom";

export interface FocusConfig {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  sound: SoundType;
  tickSound: boolean;
  notify: boolean;
  vibrate: boolean;
  workflow: WorkflowType;
}

export interface FocusState {
  phase: FocusPhase;
  startedAt: number | null;  // epoch ms when current phase started
  endsAt: number | null;     // epoch ms target for drift recovery
  remainingMs: number | null; // live remainder when paused
  isRunning: boolean;
  cycleCount: number;        // completed FOCUS blocks today
  sessionCount: number;      // total completed blocks (focus+break) today
  dailyGoal: number;         // # focus blocks target
  config: FocusConfig;
  history: Record<string, { focusBlocks: number; minutesFocused: number }>;
  quietMode: boolean;        // suppress encouragement during focus
}

export interface FocusTimerState {
  msLeft: number;
  progress: number; // 0..1
  phaseLabel: string;
  isRunning: boolean;
  phase: FocusPhase;
  cycleCount: number;
  sessionCount: number;
  dailyGoal: number;
  canAutoStart: boolean;
  nextPhase: FocusPhase;
}

// Enhanced storage key with versioning
const FOCUS_KEY = "fm_focus_v2";
const FOCUS_BACKUP_KEY = "fm_focus_backup_v2";

// Validation schemas
const CONFIG_LIMITS = {
  focusMin: { min: 1, max: 180 },
  shortMin: { min: 1, max: 30 },
  longMin: { min: 5, max: 60 },
  longEvery: { min: 2, max: 10 },
  dailyGoal: { min: 1, max: 20 }
} as const;

// Default configurations
const WORKFLOW_PRESETS: Record<WorkflowType, Partial<FocusConfig>> = {
  classic: { focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4 },
  deep: { focusMin: 50, shortMin: 10, longMin: 20, longEvery: 2 },
  sprint: { focusMin: 15, shortMin: 3, longMin: 9, longEvery: 5 },
  custom: {}
};

const DEFAULT_CONFIG: FocusConfig = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  sound: "chime",
  tickSound: false,
  notify: false,
  vibrate: false,
  workflow: "classic"
};

const DEFAULT_STATE: FocusState = {
  phase: "idle",
  startedAt: null,
  endsAt: null,
  remainingMs: null,
  isRunning: false,
  cycleCount: 0,
  sessionCount: 0,
  dailyGoal: 4,
  config: DEFAULT_CONFIG,
  history: {},
  quietMode: true
};

// Built-in base64 audio samples (tiny WAVs)
const AUDIO_SAMPLES = {
  chime: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmwhBjaS1+7ReygHIoHT8daPQQwZdL7t4KhMEAhHpODwyG4jCjmM0/PafSoGJIPJ8NiMOQkWdMXy4KhMEAhKm+H3xm8jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5bl==\"",
  bell: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmwhBjaS1+7ReygHIoHT8daPQQwZdL7t4KhMEAhHpODwyG4jCjmM0/PafSoGJIPJ8NiMOQkWdMXy4KhMEAhKm+H3xm8jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5blQEwpKn+D0wG0jCzuU2Y7PdjEOKZHO8N2RPwwagMLd46dVJgxQquL2yXAiCjiS2O3YciYFIYTI8tmJOggWeMXz45VIDw5BpN/4oF4aBjqK2O/TeywGJIHP8tiMOQkVd8Xx4qhNEApGn+H0wG0jCjmL0vLVeSYGJoLG8tiNPAIUeLvs5bl=="
};

// Event system
type EventCallback = (data?: any) => void;
type EventMap = {
  tick: (state: FocusTimerState) => void;
  phase: (newPhase: FocusPhase, oldPhase: FocusPhase) => void;
  complete: (phase: FocusPhase) => void;
  reminder: (type: 'hydration' | 'stretch') => void;
};

class FocusTimer {
  private state: FocusState;
  private listeners: Map<keyof EventMap, EventCallback[]> = new Map();
  private tickInterval: NodeJS.Timeout | null = null;
  private audioContext: AudioContext | null = null;
  private isLeader = false;
  private lastMidnightCheck = toLocalISODate();
  private saveTimeoutId: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 500;
  private readonly HIGH_PRECISION_TICK_MS = 50; // Higher precision for accuracy
  private readonly DRIFT_TOLERANCE_MS = 1000; // 1 second tolerance for drift recovery

  constructor() {
    try {
      this.state = this.loadState();
      this.setupLeaderElection();
      this.setupEventListeners();
      this.recoverActiveTimer(); // Recover any active timer on startup
      this.startTicking();
      this.checkMidnightRollover();
      
      log.info("FocusTimer initialized successfully", {
        phase: this.state.phase,
        isRunning: this.state.isRunning,
        cycleCount: this.state.cycleCount
      });
    } catch (error) {
      log.error("Failed to initialize FocusTimer:", error);
      this.state = { ...DEFAULT_STATE };
      this.handleCriticalError("initialization", error);
    }
  }

  private loadState(): FocusState {
    try {
      // Try to load from enhanced storage first
      let saved = safeStorage.get<FocusState>(FOCUS_KEY);
      
      // Fallback to legacy storage if needed
      if (!saved) {
        const legacyData = safeStorage.get("fm_focus_v1");
        if (legacyData) {
          saved = legacyData;
          // Migrate to new key
          safeStorage.set(FOCUS_KEY, saved);
          log.info("Migrated focus timer data from v1 to v2");
        }
      }
      
      if (!saved) {
        log.info("No saved focus timer state found, using defaults");
        return { ...DEFAULT_STATE };
      }
      
      // Validate and sanitize loaded state
      const validatedState = this.validateAndSanitizeState(saved);
      
      // Create backup of valid state
      this.createBackup(validatedState);
      
      return validatedState;
    } catch (error) {
      log.error("Failed to load focus timer state:", error);
      return this.attemptBackupRecovery();
    }
  }

  private validateAndSanitizeState(state: any): FocusState {
    try {
      // Merge with defaults to handle missing fields
      const mergedState: FocusState = {
        ...DEFAULT_STATE,
        ...state,
        config: { ...DEFAULT_CONFIG, ...state.config }
      };
      
      // Validate configuration values
      mergedState.config = this.validateConfig(mergedState.config);
      
      // Sanitize counters
      mergedState.cycleCount = Math.max(0, Number(mergedState.cycleCount) || 0);
      mergedState.sessionCount = Math.max(0, Number(mergedState.sessionCount) || 0);
      mergedState.dailyGoal = this.validateDailyGoal(mergedState.dailyGoal);
      
      // Validate phase
      if (!["focus", "short", "long", "idle"].includes(mergedState.phase)) {
        mergedState.phase = "idle";
        mergedState.isRunning = false;
      }
      
      // Validate timing data
      if (mergedState.startedAt && typeof mergedState.startedAt !== "number") {
        mergedState.startedAt = null;
        mergedState.isRunning = false;
      }
      
      if (mergedState.endsAt && typeof mergedState.endsAt !== "number") {
        mergedState.endsAt = null;
        mergedState.isRunning = false;
      }
      
      return mergedState;
    } catch (error) {
      log.error("State validation failed:", error);
      throw new Error("Invalid state structure");
    }
  }

  private validateConfig(config: any): FocusConfig {
    const validatedConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Validate timing values
    validatedConfig.focusMin = this.clampValue(validatedConfig.focusMin, CONFIG_LIMITS.focusMin);
    validatedConfig.shortMin = this.clampValue(validatedConfig.shortMin, CONFIG_LIMITS.shortMin);
    validatedConfig.longMin = this.clampValue(validatedConfig.longMin, CONFIG_LIMITS.longMin);
    validatedConfig.longEvery = this.clampValue(validatedConfig.longEvery, CONFIG_LIMITS.longEvery);
    
    // Validate boolean flags
    validatedConfig.autoStartBreak = Boolean(validatedConfig.autoStartBreak);
    validatedConfig.autoStartFocus = Boolean(validatedConfig.autoStartFocus);
    validatedConfig.tickSound = Boolean(validatedConfig.tickSound);
    validatedConfig.notify = Boolean(validatedConfig.notify);
    validatedConfig.vibrate = Boolean(validatedConfig.vibrate);
    
    // Validate enums
    if (!["chime", "bell", "off"].includes(validatedConfig.sound)) {
      validatedConfig.sound = "chime";
    }
    
    if (!["classic", "deep", "sprint", "custom"].includes(validatedConfig.workflow)) {
      validatedConfig.workflow = "classic";
    }
    
    return validatedConfig;
  }

  private clampValue(value: any, limits: { min: number; max: number }): number {
    const num = Number(value);
    if (isNaN(num)) return limits.min;
    return Math.max(limits.min, Math.min(limits.max, num));
  }

  private validateDailyGoal(goal: any): number {
    return this.clampValue(goal, CONFIG_LIMITS.dailyGoal);
  }

  private attemptBackupRecovery(): FocusState {
    try {
      const backup = safeStorage.get<FocusState>(FOCUS_BACKUP_KEY);
      if (backup) {
        log.info("Recovered focus timer state from backup");
        return this.validateAndSanitizeState(backup);
      }
    } catch (error) {
      log.warn("Backup recovery failed:", error);
    }
    
    log.warn("Using default focus timer state");
    return { ...DEFAULT_STATE };
  }

  private createBackup(state: FocusState): void {
    try {
      safeStorage.set(FOCUS_BACKUP_KEY, {
        ...state,
        backupTimestamp: Date.now()
      });
    } catch (error) {
      log.warn("Failed to create focus timer backup:", error);
    }
  }

  private saveState(): void {
    try {
      // Debounce saves to prevent excessive writes
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
      }
      
      this.saveTimeoutId = setTimeout(() => {
        try {
          const success = safeStorage.set(FOCUS_KEY, this.state);
          if (success) {
            this.createBackup(this.state);
            this.dispatchStorageEvent();
          } else {
            log.error("Failed to save focus timer state to storage");
          }
        } catch (error) {
          log.error("Error during state save:", error);
          this.handleCriticalError("save", error);
        }
      }, this.SAVE_DEBOUNCE_MS);
    } catch (error) {
      log.error("Failed to initiate state save:", error);
    }
  }

  private handleCriticalError(operation: string, error: any): void {
    log.error(`Critical focus timer error during ${operation}:`, error);
    
    // Emit error event for UI to handle
    try {
      this.emit("tick", this.getState());
      window.dispatchEvent(new CustomEvent("fm:focus-error", {
        detail: { operation, error: error.message || error }
      }));
    } catch (e) {
      log.error("Failed to emit error event:", e);
    }
  }

  private dispatchStorageEvent(): void {
    try {
      window.dispatchEvent(new CustomEvent("fm:data-changed", { 
        detail: { keys: [FOCUS_KEY] } 
      }));
    } catch (error) {
      log.warn("Failed to dispatch storage event:", error);
    }
  }

  private setupLeaderElection(): void {
    try {
      // Enhanced leader election with better error handling
      const checkLeader = () => {
        try {
          const now = Date.now();
          const lastPing = safeStorage.get<number>("fm_focus_leader", 0);
          
          if (now - lastPing > 2000) {
            this.isLeader = true;
            safeStorage.set("fm_focus_leader", now);
          } else {
            this.isLeader = false;
          }
        } catch (error) {
          log.warn("Leader election check failed:", error);
          // Default to leader if election fails
          this.isLeader = true;
        }
      };

      checkLeader();
      setInterval(checkLeader, 1000);
    } catch (error) {
      log.error("Failed to setup leader election:", error);
      this.isLeader = true; // Fallback to leader
    }
  }

  private recoverActiveTimer(): void {
    try {
      if (!this.state.isRunning || !this.state.endsAt) return;

      const now = performance.now() + performance.timeOrigin;
      const msLeft = Math.max(0, this.state.endsAt - now);
      
      // Check if timer should have completed while offline
      if (msLeft === 0) {
        log.info("Timer completed while offline, completing phase");
        this.completePhase();
      } else if (msLeft < this.DRIFT_TOLERANCE_MS) {
        log.info("Timer close to completion, allowing it to complete normally");
        this.state.remainingMs = msLeft;
      } else {
        log.info(`Recovered active timer with ${Math.floor(msLeft / 1000)}s remaining`);
        this.state.remainingMs = msLeft;
      }
    } catch (error) {
      log.error("Failed to recover active timer:", error);
      // Reset to safe state
      this.state.isRunning = false;
      this.state.startedAt = null;
      this.state.endsAt = null;
      this.state.remainingMs = null;
    }
  }

  private setupEventListeners(): void {
    try {
      // Storage events for cross-tab sync
      window.addEventListener("storage", (e) => {
        try {
          if (e.key === FOCUS_KEY && e.newValue) {
            const newState = JSON.parse(e.newValue);
            const oldPhase = this.state.phase;
            this.state = this.validateAndSanitizeState(newState);
            
            if (newState.phase !== oldPhase) {
              this.emit("phase", newState.phase, oldPhase);
            }
          }
        } catch (error) {
          log.warn("Error handling storage event:", error);
        }
      });

      // Enhanced visibility change for better drift recovery
      document.addEventListener("visibilitychange", () => {
        try {
          if (document.visibilityState === "visible") {
            this.recoverFromDrift();
          }
        } catch (error) {
          log.warn("Error during visibility change recovery:", error);
        }
      });

      // Enhanced page unload cleanup
      const cleanup = () => {
        try {
          this.stopTicking();
          // Force save before unload
          if (this.saveTimeoutId) {
            clearTimeout(this.saveTimeoutId);
            safeStorage.set(FOCUS_KEY, this.state);
          }
        } catch (error) {
          log.warn("Error during cleanup:", error);
        }
      };

      window.addEventListener("beforeunload", cleanup);
      window.addEventListener("pagehide", cleanup);
    } catch (error) {
      log.error("Failed to setup event listeners:", error);
    }
  }

  private recoverFromDrift(): void {
    try {
      if (!this.state.isRunning || !this.state.endsAt) return;

      const now = performance.now() + performance.timeOrigin;
      const msLeft = Math.max(0, this.state.endsAt - now);
      
      // Calculate how much drift occurred
      const expectedMsLeft = this.state.remainingMs || 0;
      const drift = Math.abs(msLeft - expectedMsLeft);
      
      if (drift > this.DRIFT_TOLERANCE_MS) {
        log.info(`Significant drift detected: ${drift}ms, recovering`);
      }
      
      if (msLeft === 0) {
        // Phase should have completed while away
        log.info("Phase completed during away time");
        this.completePhase();
      } else {
        // Update remaining time with drift-corrected value
        this.state.remainingMs = msLeft;
        log.debug(`Recovered from drift: ${msLeft}ms remaining`);
      }
    } catch (error) {
      log.error("Error during drift recovery:", error);
      // Fallback: stop timer to prevent invalid state
      this.state.isRunning = false;
      this.state.remainingMs = null;
    }
  }

  private checkMidnightRollover(): void {
    try {
      const checkMidnight = () => {
        try {
          const today = toLocalISODate();
          if (today !== this.lastMidnightCheck) {
            log.info(`Midnight rollover detected: ${this.lastMidnightCheck} → ${today}`);
            // New day - reset daily counters but preserve timing
            this.state.cycleCount = 0;
            this.state.sessionCount = 0;
            this.lastMidnightCheck = today;
            this.saveState();
            
            // Emit event for UI updates
            this.emit("tick", this.getState());
          }
        } catch (error) {
          log.warn("Error during midnight check:", error);
        }
      };

      setInterval(checkMidnight, 60000); // Check every minute
    } catch (error) {
      log.error("Failed to setup midnight rollover check:", error);
    }
  }

  private startTicking(): void {
    try {
      if (this.tickInterval) return;
      
      this.tickInterval = setInterval(() => {
        try {
          if (!this.state.isRunning) return;

          const now = performance.now() + performance.timeOrigin;
          
          if (this.state.endsAt && now >= this.state.endsAt) {
            this.completePhase();
          } else {
            const msLeft = this.state.endsAt ? Math.max(0, this.state.endsAt - now) : 0;
            this.state.remainingMs = msLeft;
            
            // Emit tick event with error handling
            try {
              this.emit("tick", this.getState());
            } catch (error) {
              log.warn("Error emitting tick event:", error);
            }
            
            // Check for reminders (reduced frequency to prevent spam)
            if (Math.floor(msLeft / 1000) % 30 === 0) {
              this.checkReminders();
            }
            
            // Tick sound with better timing
            if (this.state.config.tickSound && msLeft > 0 && Math.floor(msLeft / 1000) % 1 === 0) {
              this.playTickSound();
            }
          }
        } catch (error) {
          log.error("Error in timer tick:", error);
          this.handleCriticalError("tick", error);
        }
      }, this.HIGH_PRECISION_TICK_MS);
      
      log.debug("Timer ticking started");
    } catch (error) {
      log.error("Failed to start timer ticking:", error);
    }
  }

  private stopTicking(): void {
    try {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
        log.debug("Timer ticking stopped");
      }
      
      // Clear save timeout as well
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
        this.saveTimeoutId = null;
      }
    } catch (error) {
      log.warn("Error stopping timer:", error);
    }
  }

  private completePhase() {
    const oldPhase = this.state.phase;
    
    // Update counters
    if (oldPhase === "focus") {
      this.state.cycleCount++;
      this.updateHistory();
      
      // Award trophy for focus completion
      if (this.isLeader) {
        this.awardTrophy();
      }
      
      // Emit focus session completed event for GIPHY celebrations
      eventBus.emit('FOCUS_SESSION_ENDED', { 
        duration: this.state.config.focusMin, 
        phase: 'focus' 
      });
    }
    this.state.sessionCount++;

    // Play sound and notify only if leader
    if (this.isLeader) {
      this.playSound();
      this.showNotification(oldPhase);
      this.vibrate();
    }

    // Determine next phase
    const nextPhase = this.getNextPhase(oldPhase);
    
    // Emit completion
    this.emit("complete", oldPhase);

    // Auto-start next phase or go idle
    const shouldAutoStart = this.shouldAutoStart(oldPhase, nextPhase);
    
    if (shouldAutoStart) {
      this.start(nextPhase);
    } else {
      this.state.phase = nextPhase;
      this.state.isRunning = false;
      this.state.startedAt = null;
      this.state.endsAt = null;
      this.state.remainingMs = null;
    }

    this.emit("phase", this.state.phase, oldPhase);
    this.saveState();
  }

  private awardTrophy() {
    try {
      // Import trophy system dynamically to avoid circular dependencies
      import("./trophySystem").then(({ awardTrophy }) => {
        const result = awardTrophy(this.state.config.focusMin);
        
        // Emit trophy event for UI celebration
        this.emit("complete", this.state.phase);
        
        // Custom event for trophy celebration
        window.dispatchEvent(new CustomEvent("fm:trophy-earned", {
          detail: result
        }));
      });
    } catch (e) {
      console.warn("Failed to award trophy:", e);
    }
  }

  private getNextPhase(currentPhase: FocusPhase): FocusPhase {
    if (currentPhase === "focus") {
      return this.state.cycleCount % this.state.config.longEvery === 0 ? "long" : "short";
    }
    return "focus";
  }

  private shouldAutoStart(oldPhase: FocusPhase, nextPhase: FocusPhase): boolean {
    if (oldPhase === "focus") return this.state.config.autoStartBreak;
    if (nextPhase === "focus") return this.state.config.autoStartFocus;
    return false;
  }

  private updateHistory() {
    const today = toLocalISODate();
    const current = this.state.history[today] || { focusBlocks: 0, minutesFocused: 0 };
    
    this.state.history[today] = {
      focusBlocks: current.focusBlocks + 1,
      minutesFocused: current.minutesFocused + this.state.config.focusMin
    };
  }

  private checkReminders() {
    // Check hydration (every 30 min default)
    const hydrationMs = (this.state.config.focusMin || 30) * 60 * 1000;
    // Check stretch (every 60 min default) 
    const stretchMs = (this.state.config.focusMin * 2 || 60) * 60 * 1000;
    
    // Emit reminder events - let other components handle timing logic
    this.emit("reminder", "hydration");
    this.emit("reminder", "stretch");
  }

  private async playSound() {
    if (this.state.config.sound === "off") return;
    
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const sample = AUDIO_SAMPLES[this.state.config.sound];
      const response = await fetch(sample);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (e) {
      console.warn("Failed to play focus timer sound:", e);
    }
  }

  private playTickSound() {
    if (!this.state.config.tickSound || !this.isLeader) return;
    
    // Simple tick with Web Audio API
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch {}
  }

  private showNotification(completedPhase: FocusPhase) {
    if (!this.state.config.notify || !("Notification" in window)) return;
    
    if (Notification.permission !== "granted") return;
    
    const isBreak = completedPhase !== "focus";
    const nextPhase = this.getNextPhase(completedPhase);
    const nextDuration = this.getPhaseDuration(nextPhase);
    
    const title = isBreak 
      ? "🎯 Break complete — time to focus!"
      : `🎉 Focus session complete — ${nextPhase === "long" ? "long" : "short"} break time!`;
    
    const body = `Next: ${nextDuration} minutes`;
    
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: isBreak ? "🎯" : "🎉",
      silent: false
    });
  }

  private vibrate() {
    if (!this.state.config.vibrate || !("vibrate" in navigator)) return;
    
    try {
      navigator.vibrate([120, 60, 120]);
    } catch {}
  }

  private getPhaseDuration(phase: FocusPhase): number {
    switch (phase) {
      case "focus": return this.state.config.focusMin;
      case "short": return this.state.config.shortMin;
      case "long": return this.state.config.longMin;
      default: return 0;
    }
  }

  private emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => {
      try {
        (cb as any)(...args);
      } catch (e) {
        console.warn(`Error in focus timer event ${event}:`, e);
      }
    });
  }

  // Public API
  on<K extends keyof EventMap>(event: K, callback: EventMap[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as EventCallback);
    
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback as EventCallback);
      if (index >= 0) callbacks.splice(index, 1);
    };
  }

  start(phase: FocusPhase = "focus"): boolean {
    try {
      const duration = this.getPhaseDuration(phase);
      if (duration <= 0) {
        log.error(`Invalid duration for phase ${phase}: ${duration}`);
        return false;
      }
      
      const now = performance.now() + performance.timeOrigin;
      
      this.state.phase = phase;
      this.state.isRunning = true;
      this.state.startedAt = now;
      this.state.endsAt = now + (duration * 60 * 1000);
      this.state.remainingMs = duration * 60 * 1000;
      
      this.saveState();
      this.emit("phase", phase, "idle");
      
      log.info(`Started ${phase} phase for ${duration} minutes`);
      return true;
    } catch (error) {
      log.error("Failed to start timer:", error);
      return false;
    }
  }

  pause() {
    if (!this.state.isRunning) return;
    
    const now = performance.now() + performance.timeOrigin;
    this.state.remainingMs = this.state.endsAt ? Math.max(0, this.state.endsAt - now) : 0;
    this.state.isRunning = false;
    this.state.startedAt = null;
    this.state.endsAt = null;
    
    this.saveState();
  }

  resume() {
    if (this.state.isRunning || !this.state.remainingMs) return;
    
    const now = performance.now() + performance.timeOrigin;
    this.state.isRunning = true;
    this.state.startedAt = now;
    this.state.endsAt = now + this.state.remainingMs;
    
    this.saveState();
  }

  stop() {
    this.state.phase = "idle";
    this.state.isRunning = false;
    this.state.startedAt = null;
    this.state.endsAt = null;
    this.state.remainingMs = null;
    
    this.saveState();
  }

  skip() {
    if (!this.state.isRunning) return;
    this.completePhase();
  }

  next() {
    const currentPhase = this.state.phase;
    const nextPhase = this.getNextPhase(currentPhase);
    this.start(nextPhase);
  }

  getState(): FocusTimerState {
    const msLeft = this.state.isRunning && this.state.endsAt 
      ? Math.max(0, this.state.endsAt - (performance.now() + performance.timeOrigin))
      : this.state.remainingMs || 0;
    
    const totalMs = this.getPhaseDuration(this.state.phase) * 60 * 1000;
    const progress = totalMs > 0 ? Math.max(0, Math.min(1, (totalMs - msLeft) / totalMs)) : 0;
    
    const phaseLabels = {
      focus: "Focus",
      short: "Short Break", 
      long: "Long Break",
      idle: "Ready"
    };

    const nextPhase = this.getNextPhase(this.state.phase);
    const canAutoStart = this.shouldAutoStart(this.state.phase, nextPhase);

    return {
      msLeft,
      progress,
      phaseLabel: phaseLabels[this.state.phase],
      isRunning: this.state.isRunning,
      phase: this.state.phase,
      cycleCount: this.state.cycleCount,
      sessionCount: this.state.sessionCount,
      dailyGoal: this.state.dailyGoal,
      canAutoStart,
      nextPhase
    };
  }

  getConfig(): FocusConfig {
    return { ...this.state.config };
  }

  updateConfig(updates: Partial<FocusConfig>): boolean {
    try {
      // Validate config updates before applying
      const validatedUpdates = this.validateConfig({ ...this.state.config, ...updates });
      this.state.config = validatedUpdates;
      this.saveState();
      
      // Force state update for UI components
      this.emit('tick', this.getState());
      
      log.info("Focus timer config updated", validatedUpdates);
      return true;
    } catch (error) {
      log.error("Failed to update config:", error);
      return false;
    }
  }

  setDailyGoal(goal: number): boolean {
    try {
      const validatedGoal = this.validateDailyGoal(goal);
      this.state.dailyGoal = validatedGoal;
      this.saveState();
      
      log.info(`Daily goal updated to ${validatedGoal}`);
      return true;
    } catch (error) {
      log.error("Failed to set daily goal:", error);
      return false;
    }
  }

  resetToday(): boolean {
    try {
      this.stop();
      this.state.cycleCount = 0;
      this.state.sessionCount = 0;
      
      const today = toLocalISODate();
      delete this.state.history[today];
      
      this.saveState();
      
      log.info("Today's focus timer data reset");
      return true;
    } catch (error) {
      log.error("Failed to reset today's data:", error);
      return false;
    }
  }

  // Enhanced cleanup method for proper resource management
  destroy(): void {
    try {
      log.info("Destroying focus timer instance");
      
      this.stopTicking();
      
      // Clear all listeners
      this.listeners.clear();
      
      // Close audio context
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      // Force final save
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
        safeStorage.set(FOCUS_KEY, this.state);
      }
      
      log.info("Focus timer destroyed successfully");
    } catch (error) {
      log.error("Error during focus timer destruction:", error);
    }
  }

  getHistory() {
    return { ...this.state.history };
  }

  async requestNotificationPermission() {
    if (!("Notification" in window)) return false;
    
    if (Notification.permission === "granted") return true;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Enable audio context (call after user gesture)
  async enableAudio() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const focusTimer = new FocusTimer();
export default focusTimer;
