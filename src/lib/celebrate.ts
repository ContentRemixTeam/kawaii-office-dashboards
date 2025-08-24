import { getCelebrationsEnabled, getEncouragementsEnabled } from "@/lib/storage";
import { getRandomEncouragement } from "@/lib/encouragement";

export interface CelebratePayload {
  type: 'trophy' | 'task' | 'confetti' | 'general';
  message?: string;
  emoji?: string;
  data?: any;
  encouragement?: string;
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
  // Skip if both celebrations and encouragements are disabled
  if (!getCelebrationsEnabled() && !getEncouragementsEnabled()) return;
  
  // Add encouragement if enabled
  const enrichedPayload = {
    ...payload,
    encouragement: getEncouragementsEnabled() ? getRandomEncouragement() : undefined
  };
  
  subscribers.forEach(fn => fn(enrichedPayload));
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