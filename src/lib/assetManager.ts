import { CharacterAsset, AccessoryPosition } from '@/types/character';

// Default asset database - will be expanded with uploads
export const DEFAULT_ASSETS: CharacterAsset[] = [
  // Character Bases
  {
    id: 'bee-base',
    name: 'Cute Bee',
    type: 'base',
    filepath: '/characters/bases/bee/bee-base.png',
    price: 0,
    currency: 'coins',
    rarity: 'common'
  },
  
  // Accessories
  {
    id: 'glasses-round',
    name: 'Round Glasses',
    type: 'accessory',
    category: 'glasses',
    filepath: '/characters/customization/accessories/glasses-round.png',
    price: 50,
    currency: 'coins',
    rarity: 'common',
    defaultPosition: { x: 0, y: -15, scale: 0.85, rotation: 0, opacity: 1 }
  },
  
  // Baseball Cap
  {
    id: 'baseball-cap',
    name: 'Baseball Cap',
    type: 'accessory', 
    category: 'hats',
    filepath: '/characters/customization/accessories/baseball-cap.png',
    price: 100,
    currency: 'coins',
    rarity: 'common',
    defaultPosition: { x: 0, y: -40, scale: 1.0, rotation: 0, opacity: 1 }
  }
];

// Default accessory positions for different categories
export const DEFAULT_POSITIONS: Record<string, AccessoryPosition> = {
  glasses: { x: 0, y: -5, scale: 0.85, rotation: 0, opacity: 1 },
  hats: { x: 0, y: -40, scale: 1.0, rotation: 0, opacity: 1 },
  clothing: { x: 0, y: 10, scale: 1.0, rotation: 0, opacity: 1 },
  pets: { x: 30, y: 20, scale: 0.6, rotation: 0, opacity: 1 }
};

// Storage keys
const ASSETS_STORAGE_KEY = 'character_assets_v1';
const UPLOADED_ASSETS_KEY = 'uploaded_assets_v1';

/**
 * Get all available assets (default + uploaded)
 */
export function getAllAssets(): CharacterAsset[] {
  const uploadedAssets = getUploadedAssets();
  return [...DEFAULT_ASSETS, ...uploadedAssets];
}

/**
 * Get assets by type
 */
export function getAssetsByType(type: CharacterAsset['type']): CharacterAsset[] {
  return getAllAssets().filter(asset => asset.type === type);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: CharacterAsset['category']): CharacterAsset[] {
  return getAllAssets().filter(asset => asset.category === category);
}

/**
 * Get asset by ID
 */
export function getAssetById(id: string): CharacterAsset | undefined {
  return getAllAssets().find(asset => asset.id === id);
}

/**
 * Get uploaded assets from localStorage
 */
function getUploadedAssets(): CharacterAsset[] {
  try {
    const stored = localStorage.getItem(UPLOADED_ASSETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading uploaded assets:', error);
    return [];
  }
}

/**
 * Save uploaded assets to localStorage
 */
function saveUploadedAssets(assets: CharacterAsset[]): void {
  try {
    localStorage.setItem(UPLOADED_ASSETS_KEY, JSON.stringify(assets));
  } catch (error) {
    console.error('Error saving uploaded assets:', error);
  }
}

/**
 * Add a new uploaded asset
 */
export async function addUploadedAsset(
  file: File,
  name: string,
  category: CharacterAsset['category'],
  price: number,
  currency: CharacterAsset['currency'],
  rarity: CharacterAsset['rarity']
): Promise<CharacterAsset> {
  // Create asset ID
  const assetId = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert file to base64 for storage
  const base64 = await fileToBase64(file);
  
  // Create asset object
  const asset: CharacterAsset = {
    id: assetId,
    name,
    type: 'accessory',
    category,
    filepath: base64, // Store as base64 for uploaded assets
    price,
    currency,
    rarity,
    defaultPosition: DEFAULT_POSITIONS[category || 'glasses'] || DEFAULT_POSITIONS.glasses
  };
  
  // Save to uploaded assets
  const uploadedAssets = getUploadedAssets();
  uploadedAssets.push(asset);
  saveUploadedAssets(uploadedAssets);
  
  return asset;
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Remove uploaded asset
 */
export function removeUploadedAsset(assetId: string): void {
  const uploadedAssets = getUploadedAssets();
  const filtered = uploadedAssets.filter(asset => asset.id !== assetId);
  saveUploadedAssets(filtered);
}

/**
 * Get rarity color classes
 */
export function getRarityColor(rarity: CharacterAsset['rarity']): string {
  switch (rarity) {
    case 'common': return 'border-gray-300 bg-gray-50 text-gray-700';
    case 'rare': return 'border-blue-300 bg-blue-50 text-blue-700';
    case 'legendary': return 'border-purple-300 bg-purple-50 text-purple-700';
    default: return 'border-gray-300 bg-gray-50 text-gray-700';
  }
}