import React from 'react';
import { PNGCharacter, EquippedAccessory } from '@/types/character';
import { getAssetById } from '@/lib/assetManager';

interface CharacterPreviewProps {
  character: PNGCharacter;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
  className?: string;
}

const sizeMap = {
  small: { width: 120, height: 120, padding: 16 },   // inset-4 = 16px
  medium: { width: 200, height: 200, padding: 16 },  // inset-4 = 16px  
  large: { width: 300, height: 300, padding: 32 }    // inset-8 = 32px
};

export default function CharacterPreview({ 
  character, 
  size = 'medium', 
  showBackground = true,
  className = '' 
}: CharacterPreviewProps) {
  const config = sizeMap[size];
  const baseAsset = getAssetById(character.baseAsset);
  
  if (!baseAsset) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ width: config.width, height: config.height }}
      >
        <span className="text-muted-foreground">No character</span>
      </div>
    );
  }

  // Calculate scaling factor relative to the BeeAccessoriesCustomizer's 400px container
  const baseContainerSize = 400; // BeeAccessoriesCustomizer uses 400px
  const scaleFactor = config.width / baseContainerSize;

  return (
    <div 
      className={`relative overflow-hidden ${showBackground ? 'bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg' : ''} ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      {/* Base Character - using exact same logic as BeeAccessoriesCustomizer */}
      <img
        src={baseAsset.filepath.startsWith('data:') ? baseAsset.filepath : `${baseAsset.filepath}?v=${Date.now()}`}
        alt={baseAsset.name}
        className={`absolute w-auto h-auto object-contain z-10`}
        style={{ 
          inset: `${config.padding}px`,
          width: `calc(100% - ${config.padding * 2}px)`,
          height: `calc(100% - ${config.padding * 2}px)`
        }}
      />

      {/* Equipped Accessories - using exact same logic as BeeAccessoriesCustomizer */}
      {character.equippedAccessories.map((equipped, index) => {
        const accessory = getAssetById(equipped.assetId);
        if (!accessory) return null;

        // Scale positions proportionally based on container size
        const scaledX = equipped.position.x * scaleFactor;
        const scaledY = equipped.position.y * scaleFactor;

        return (
          <img
            key={equipped.assetId + index}
            src={accessory.filepath.startsWith('data:') ? accessory.filepath : `${accessory.filepath}?v=${Date.now()}`}
            alt={accessory.name}
            className={`absolute w-auto h-auto object-contain pointer-events-none z-20`}
            style={{
              inset: `${config.padding}px`,
              width: `calc(100% - ${config.padding * 2}px)`,
              height: `calc(100% - ${config.padding * 2}px)`,
              transform: `translate(${scaledX}px, ${scaledY}px) scale(${equipped.position.scale}) rotate(${equipped.position.rotation || 0}deg)`,
              opacity: equipped.position.opacity || 1
            }}
          />
        );
      })}
    </div>
  );
}