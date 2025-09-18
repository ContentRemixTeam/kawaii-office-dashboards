// PNG-based Character System Types

export interface AccessoryPosition {
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  opacity?: number;
}

export interface CharacterAsset {
  id: string;
  name: string;
  type: 'base' | 'accessory';
  category?: 'glasses' | 'hats' | 'clothing' | 'pets' | 'backgrounds';
  filepath: string;
  price: number;
  currency: 'coins' | 'special';
  rarity: 'common' | 'rare' | 'legendary';
  unlockCondition?: string;
  defaultPosition?: AccessoryPosition;
}

export interface EquippedAccessory {
  assetId: string;
  position: AccessoryPosition;
}

export interface PNGCharacter {
  id: string;
  name: string;
  baseAsset: string; // Asset ID for the character base (bee, etc.)
  equippedAccessories: EquippedAccessory[];
  coins: number;
  specialCurrency: number;
  unlockedAssets: string[];
  room: {
    background: string;
    decorations: string[];
  };
}

export interface AssetUpload {
  file: File;
  name: string;
  category: CharacterAsset['category'];
  price: number;
  currency: CharacterAsset['currency'];
  rarity: CharacterAsset['rarity'];
}