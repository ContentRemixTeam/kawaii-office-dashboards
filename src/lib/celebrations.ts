import { getCelebrationsEnabled } from './storage';

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
    return celebrationCache;
  }

  try {
    const response = await fetch('/celebrations/celebrations.json');
    if (!response.ok) {
      throw new Error('Failed to load celebrations');
    }
    
    const data = await response.json();
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
  if (!getCelebrationsEnabled()) {
    return null;
  }

  const data = await loadCelebrations();
  
  // Determine which pets are valid for this occasion
  const validPets = data.occasions[occasion] || ['general'];
  
  // Try to use the specified pet first
  let targetPet = pet;
  if (!targetPet || !validPets.includes(targetPet)) {
    targetPet = 'general';
  }
  
  // Get gifs for the target pet
  let gifs = data.pets[targetPet] || [];
  
  // If no gifs for target pet, try general
  if (gifs.length === 0) {
    gifs = data.pets.general || [];
  }
  
  // If still no gifs, return null
  if (gifs.length === 0) {
    return null;
  }
  
  // Pick a random gif
  const randomIndex = Math.floor(Math.random() * gifs.length);
  const selectedGif = gifs[randomIndex];
  
  // Check for blocked keywords in URL or message
  const hasBlockedContent = data.blockedKeywords.some(keyword => 
    selectedGif.url.toLowerCase().includes(keyword.toLowerCase()) ||
    selectedGif.msg.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasBlockedContent) {
    console.warn('Blocked content detected, using fallback');
    return data.pets.general?.[0] || null;
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