import { PetKey } from './celebrations';

// Valid pet keys that match celebrations.json
export const VALID_PET_KEYS: PetKey[] = [
  'unicorn', 'dragon', 'cat', 'dog', 'bunny', 
  'fox', 'panda', 'penguin', 'owl', 'hamster'
];

// Pet key mapping for synonyms and display names
const PET_KEY_MAP: Record<string, PetKey | 'general'> = {
  // Exact matches (lowercase)
  'unicorn': 'unicorn',
  'dragon': 'dragon',
  'cat': 'cat',
  'dog': 'dog',
  'bunny': 'bunny',
  'fox': 'fox',
  'panda': 'panda',
  'penguin': 'penguin',
  'owl': 'owl',
  'hamster': 'hamster',
  
  // Common synonyms
  'rabbit': 'bunny',
  'kitty': 'cat',
  'kitten': 'cat',
  'puppy': 'dog',
  'doggy': 'dog',
  
  // Fallbacks
  'none': 'general',
  'no pet': 'general',
  'default': 'general',
  '': 'general'
};

/**
 * Normalize a pet key to match the celebrations.json format
 * @param petKey - Raw pet key from user input or storage
 * @returns Normalized pet key or 'general' as fallback
 */
export function normalizePetKey(petKey: string | undefined | null): PetKey | 'general' {
  if (!petKey) return 'general';
  
  const normalized = petKey.toLowerCase().trim();
  return PET_KEY_MAP[normalized] || 'general';
}

/**
 * Simple string hash function (DJB2 algorithm)
 * Used for deterministic selection
 * @param str - String to hash
 * @returns Hash number
 */
export function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 * @returns Date string
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.getFullYear() + '-' + 
         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
         String(now.getDate()).padStart(2, '0');
}

/**
 * Create a deterministic seed for gif selection
 * @param date - Date string (YYYY-MM-DD)
 * @param occasion - Celebration occasion
 * @param pet - Pet key
 * @returns Seed string
 */
export function createSelectionSeed(date: string, occasion: string, pet: string): string {
  return `${date}|${occasion}|${pet}`;
}