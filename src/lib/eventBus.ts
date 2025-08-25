/**
 * Type-safe event bus for cross-feature communication
 */

export interface AppEvents {
  TASK_COMPLETED: { taskId: string; isDaily: boolean };
  FOCUS_SESSION_ENDED: { duration: number; phase: 'focus' | 'short' | 'long' };
  AFFIRMATION_DRAWN: { affirmation: string; timestamp: number };
  PET_STAGE_CHANGED: { animal: string; stage: number };
  TROPHY_EARNED: { type: string; count: number };
  THEME_CHANGED: { theme: string };
  INTENTION_SET: { intention: string; feel: string };
  POWER_WORD_CHANGED: { word: string; category: string };
  CELEBRATION_TRIGGERED: { type: string; data: any };
}

type EventListener<T = any> = (data: T) => void;
type EventMap = { [K in keyof AppEvents]: EventListener<AppEvents[K]>[] };

class TypedEventBus {
  private listeners: Partial<EventMap> = {};

  on<K extends keyof AppEvents>(
    event: K,
    listener: EventListener<AppEvents[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    // Return unsubscribe function
    return () => {
      const list = this.listeners[event];
      if (list) {
        const index = list.indexOf(listener);
        if (index > -1) {
          list.splice(index, 1);
        }
      }
    };
  }

  emit<K extends keyof AppEvents>(event: K, data: AppEvents[K]): void {
    const list = this.listeners[event];
    if (list) {
      list.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  off<K extends keyof AppEvents>(event: K, listener?: EventListener<AppEvents[K]>): void {
    if (!listener) {
      delete this.listeners[event];
      return;
    }

    const list = this.listeners[event];
    if (list) {
      const index = list.indexOf(listener);
      if (index > -1) {
        list.splice(index, 1);
      }
    }
  }

  clear(): void {
    this.listeners = {};
  }
}

export const eventBus = new TypedEventBus();