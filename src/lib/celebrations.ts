import { getCelebrationsEnabled, getSettings } from './storage';
import { simpleHash, createSelectionSeed, getTodayDateString, normalizePetKey } from './pets';

export interface GifItem {
  id: string;
  url: string;
  msg: string;
  credit: string;
}

export interface CelebrationData {
  version: number;
  pets: Record<string, GifItem[]>;
  occasions: Record<string, string[]>;
  blockedKeywords: string[];
}

export type PetKey = 'unicorn' | 'dragon' | 'cat' | 'dog' | 'bunny' | 'fox' | 'panda' | 'penguin' | 'owl' | 'hamster';
export type Occasion = 'taskComplete' | 'pomodoroComplete' | 'microWinLogged';

let celebrationCache: CelebrationData | null = null;

export async function loadCelebrations(): Promise<CelebrationData> {
  if (celebrationCache) {
    console.log('[celebrations] Using cached data');
    return celebrationCache;
  }

  try {
    console.log('[celebrations] Loading celebrations.json...');
    const response = await fetch('/celebrations/celebrations.json');
    if (!response.ok) {
      throw new Error(`Failed to load celebrations: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[celebrations] Loaded celebrations data:', data);
    celebrationCache = data;
    return data;
  } catch (error) {
    console.warn('Failed to load celebrations.json, using fallback:', error);
    
    // Fallback data
    const fallback: CelebrationData = {
      version: 1,
      pets: {
        general: [
          { id: 'fallback01', url: '/gifs/celebrate_generic.gif', msg: 'Great job! 🎉', credit: 'internal' }
        ]
      },
      occasions: {
        taskComplete: ['general'],
        pomodoroComplete: ['general'],
        microWinLogged: ['general']
      },
      blockedKeywords: []
    };
    
    celebrationCache = fallback;
    return fallback;
  }
}

export async function pickGif({ pet, occasion }: { pet?: PetKey | 'general'; occasion: Occasion }): Promise<GifItem | null> {
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    console.log('[celebrate] Starting selection:', { pet, occasion });
  }
  
  if (!getCelebrationsEnabled()) {
    if (isDev) console.log('[celebrate] Celebrations disabled globally');
    return null;
  }

  const data = await loadCelebrations();
  const settings = getSettings();
  const forcePetTheme = settings.encouragement?.forcePetTheme ?? true;
  
  // Normalize the pet key
  const normalizedPet = normalizePetKey(pet);
  
  // Determine which pets are valid for this occasion
  const validPets = data.occasions[occasion] || ['general'];
  
  // Create deterministic seed for selection
  const dateStr = getTodayDateString();
  let selectedGif: GifItem | null = null;
  let usedPet = 'general';
  let pickedId = '';
  
  if (forcePetTheme && normalizedPet !== 'general' && validPets.includes(normalizedPet)) {
    // Try pet-specific gifs first
    const petGifs = data.pets[normalizedPet] || [];
    
    if (petGifs.length > 0) {
      const seed = createSelectionSeed(dateStr, occasion, normalizedPet);
      const index = simpleHash(seed) % petGifs.length;
      selectedGif = petGifs[index];
      usedPet = normalizedPet;
      pickedId = selectedGif.id;
    }
  }
  
  // Fallback to general if no pet-specific gif found
  if (!selectedGif) {
    const generalGifs = data.pets.general || [];
    if (generalGifs.length > 0) {
      const seed = createSelectionSeed(dateStr, occasion, 'general');
      const index = simpleHash(seed) % generalGifs.length;
      selectedGif = generalGifs[index];
      usedPet = 'general';
      pickedId = selectedGif.id;
    }
  }
  
  // Still no gif found
  if (!selectedGif) {
    if (isDev) console.warn('[celebrate] No gifs available for occasion:', occasion);
    return null;
  }
  
  // Check for blocked keywords
  const hasBlockedContent = data.blockedKeywords.some(keyword => 
    selectedGif!.url.toLowerCase().includes(keyword.toLowerCase()) ||
    selectedGif!.msg.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasBlockedContent) {
    if (isDev) console.warn('[celebrate] Blocked content detected, using fallback');
    const fallback = data.pets.general?.[0];
    if (fallback) {
      usedPet = 'general';
      pickedId = fallback.id;
      selectedGif = fallback;
    }
  }
  
  // Development logging
  if (isDev && selectedGif) {
    console.log(`[celebrate] occasion=${occasion} pet=${normalizedPet} picked=${pickedId} url=${selectedGif.url}`);
  }
  
  return selectedGif;
}

export function preloadGifs(pets: PetKey[]): void {
  // Preload one gif per pet for better performance
  loadCelebrations().then(data => {
    pets.forEach(pet => {
      const gifs = data.pets[pet];
      if (gifs && gifs.length > 0) {
        const img = new Image();
        img.src = gifs[0].url;
      }
    });
  }).catch(console.warn);
}