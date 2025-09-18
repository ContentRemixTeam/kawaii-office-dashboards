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
  small: { width: 120, height: 120 },
  medium: { width: 200, height: 200 },
  large: { width: 300, height: 300 }
};

export default function CharacterPreview({ 
  character, 
  size = 'medium', 
  showBackground = true,
  className = '' 
}: CharacterPreviewProps) {
  const dimensions = sizeMap[size];
  const baseAsset = getAssetById(character.baseAsset);
  
  if (!baseAsset) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={dimensions}
      >
        <span className="text-muted-foreground">No character</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${showBackground ? 'bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4' : ''} ${className}`}
      style={dimensions}
    >
      {/* Base Character */}
      <img
        src={baseAsset.filepath.startsWith('data:') ? baseAsset.filepath : `${baseAsset.filepath}?v=${Date.now()}`}
        alt={baseAsset.name}
        className="absolute inset-0 w-full h-full object-contain z-10"
        style={{ 
          transform: showBackground ? 'scale(0.8)' : 'scale(1)' 
        }}
      />

      {/* Equipped Accessories */}
      {character.equippedAccessories.map((equipped, index) => {
        const accessory = getAssetById(equipped.assetId);
        if (!accessory) return null;

        // Improved positioning to match bee test page
        const containerScale = showBackground ? 0.8 : 1.0;
        const baseScale = equipped.position.scale * containerScale;
        
        // Better position scaling that maintains proportions
        const sizeMultiplier = dimensions.width / 200; // Base size is 200px
        const adjustedX = equipped.position.x * sizeMultiplier * containerScale;
        const adjustedY = equipped.position.y * sizeMultiplier * containerScale;

        return (
          <img
            key={equipped.assetId + index}
            src={accessory.filepath.startsWith('data:') ? accessory.filepath : `${accessory.filepath}?v=${Date.now()}`}
            alt={accessory.name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
            style={{
              transform: `translate(${adjustedX}px, ${adjustedY}px) scale(${baseScale}) rotate(${equipped.position.rotation || 0}deg)`,
              opacity: equipped.position.opacity || 1
            }}
          />
        );
      })}
    </div>
  );
}