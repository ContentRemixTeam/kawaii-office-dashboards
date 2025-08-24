import { toLocalISODate } from "@/lib/localDate";

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

const FOCUS_KEY = "fm_focus_v1";

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

  constructor() {
    this.state = this.loadState();
    this.setupLeaderElection();
    this.setupEventListeners();
    this.startTicking();
    this.checkMidnightRollover();
  }

  private loadState(): FocusState {
    try {
      const saved = localStorage.getItem(FOCUS_KEY);
      if (!saved) return { ...DEFAULT_STATE };
      
      const parsed = JSON.parse(saved);
      
      // Merge with defaults to handle version upgrades
      return {
        ...DEFAULT_STATE,
        ...parsed,
        config: { ...DEFAULT_CONFIG, ...parsed.config }
      };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  private saveState() {
    try {
      localStorage.setItem(FOCUS_KEY, JSON.stringify(this.state));
      this.dispatchStorageEvent();
    } catch (e) {
      console.warn("Failed to save focus timer state:", e);
    }
  }

  private dispatchStorageEvent() {
    try {
      window.dispatchEvent(new CustomEvent("fm:data-changed", { 
        detail: { keys: [FOCUS_KEY] } 
      }));
    } catch {}
  }

  private setupLeaderElection() {
    // Simple leader election using localStorage timestamp
    const checkLeader = () => {
      const now = Date.now();
      const lastPing = parseInt(localStorage.getItem("fm_focus_leader") || "0");
      
      if (now - lastPing > 2000) {
        this.isLeader = true;
        localStorage.setItem("fm_focus_leader", now.toString());
      } else {
        this.isLeader = false;
      }
    };

    checkLeader();
    setInterval(checkLeader, 1000);
  }

  private setupEventListeners() {
    // Storage events for cross-tab sync
    window.addEventListener("storage", (e) => {
      if (e.key === FOCUS_KEY) {
        const newState = this.loadState();
        const oldPhase = this.state.phase;
        this.state = newState;
        
        if (newState.phase !== oldPhase) {
          this.emit("phase", newState.phase, oldPhase);
        }
      }
    });

    // Visibility change for drift recovery
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.recoverFromDrift();
      }
    });

    // Page unload
    window.addEventListener("beforeunload", () => {
      this.stopTicking();
    });
  }

  private recoverFromDrift() {
    if (!this.state.isRunning || !this.state.endsAt) return;

    const now = performance.now() + performance.timeOrigin;
    const msLeft = Math.max(0, this.state.endsAt - now);
    
    if (msLeft === 0) {
      // Phase should have completed while away
      this.completePhase();
    } else {
      // Update remaining time
      this.state.remainingMs = msLeft;
    }
  }

  private checkMidnightRollover() {
    const checkMidnight = () => {
      const today = toLocalISODate();
      if (today !== this.lastMidnightCheck) {
        // New day - reset daily counters but keep timing
        this.state.cycleCount = 0;
        this.state.sessionCount = 0;
        this.lastMidnightCheck = today;
        this.saveState();
      }
    };

    setInterval(checkMidnight, 60000); // Check every minute
  }

  private startTicking() {
    if (this.tickInterval) return;
    
    this.tickInterval = setInterval(() => {
      if (!this.state.isRunning) return;

      const now = performance.now() + performance.timeOrigin;
      
      if (this.state.endsAt && now >= this.state.endsAt) {
        this.completePhase();
      } else {
        const msLeft = this.state.endsAt ? Math.max(0, this.state.endsAt - now) : 0;
        this.state.remainingMs = msLeft;
        
        // Emit tick event
        this.emit("tick", this.getState());
        
        // Check for reminders every 5 seconds
        if (Math.floor(msLeft / 1000) % 5 === 0) {
          this.checkReminders();
        }
        
        // Tick sound
        if (this.state.config.tickSound && Math.floor(msLeft / 1000) % 1 === 0) {
          this.playTickSound();
        }
      }
    }, 100); // High frequency for smooth progress
  }

  private stopTicking() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
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

  start(phase: FocusPhase = "focus") {
    const duration = this.getPhaseDuration(phase);
    const now = performance.now() + performance.timeOrigin;
    
    this.state.phase = phase;
    this.state.isRunning = true;
    this.state.startedAt = now;
    this.state.endsAt = now + (duration * 60 * 1000);
    this.state.remainingMs = duration * 60 * 1000;
    
    this.saveState();
    this.emit("phase", phase, "idle");
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

  updateConfig(updates: Partial<FocusConfig>) {
    this.state.config = { ...this.state.config, ...updates };
    this.saveState();
    // Force state update for UI components
    this.emit('tick', this.getState());
  }

  setDailyGoal(goal: number) {
    this.state.dailyGoal = Math.max(1, goal);
    this.saveState();
  }

  resetToday() {
    this.stop();
    this.state.cycleCount = 0;
    this.state.sessionCount = 0;
    
    const today = toLocalISODate();
    delete this.state.history[today];
    
    this.saveState();
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
