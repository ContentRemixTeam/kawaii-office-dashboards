import { getCelebrationsEnabled } from "@/lib/storage";

export interface CelebratePayload {
  type: 'trophy' | 'task' | 'confetti' | 'general';
  message?: string;
  emoji?: string;
  data?: any;
}

type CelebrationSubscriber = (payload: CelebratePayload) => void;

const subscribers: CelebrationSubscriber[] = [];

export function subscribe(fn: CelebrationSubscriber): () => void {
  subscribers.push(fn);
  return () => {
    const index = subscribers.indexOf(fn);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

export function celebrate(payload: CelebratePayload): void {
  if (!getCelebrationsEnabled()) return; // Skip if disabled
  subscribers.forEach(fn => fn(payload));
}

// Convenience functions for common celebrations
export function celebrateConfetti(): void {
  celebrate({ type: 'confetti' });
}

export function celebrateTrophy(message: string, data?: any): void {
  celebrate({ type: 'trophy', message, data });
}

export function celebrateTask(emoji: string, message?: string): void {
  celebrate({ type: 'task', emoji, message });
}