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
  small: { width: 120, height: 120, className: 'inset-4' },   // inset-4 = 16px
  medium: { width: 200, height: 200, className: 'inset-4' },  // inset-4 = 16px - matches BeeAccessoriesCustomizer mini preview exactly
  large: { width: 400, height: 400, className: 'inset-8' }    // inset-8 = 32px - matches BeeAccessoriesCustomizer positioning view exactly
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

  // CRITICAL FIX: Use exact same positioning logic as BeeAccessoriesCustomizer
  // Large size (400px): use raw positions (1.0 multiplier) - matches positioning view exactly
  // Medium size (200px): use 0.5 multiplier - matches mini preview exactly  
  // Small size (120px): use 0.5 multiplier for consistency
  const POSITION_MULTIPLIER = size === 'large' ? 1.0 : 0.5;
  
  console.log(`🔍 POSITION DEBUG - Size: ${size}, multiplier: ${POSITION_MULTIPLIER}, container: ${config.className}`);

  return (
    <div 
      className={`relative overflow-hidden ${showBackground ? 'bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg' : ''} ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      {/* CRITICAL: Add the exact same container padding as BeeAccessoriesCustomizer */}
      <div 
        className={`relative mx-auto ${showBackground ? 'bg-muted/20 rounded-lg' : ''} ${
          size === 'large' ? 'p-8' : 'p-4'
        }`}
        style={{ width: config.width, height: config.height }}
      >
        {/* Base Character - EXACT same structure as BeeAccessoriesCustomizer */}
        <img
          src={baseAsset.filepath.startsWith('data:') ? baseAsset.filepath : `${baseAsset.filepath}?v=${Date.now()}`}
          alt={baseAsset.name}
          className={`absolute ${config.className} w-auto h-auto object-contain`}
          style={{ 
            // Use exact same CSS structure as BeeAccessoriesCustomizer:
            // Large: inset-8 class = 32px inset
            // Medium/Small: inset-4 class = 16px inset
            width: size === 'large' ? 'calc(100% - 64px)' : 'calc(100% - 32px)',
            height: size === 'large' ? 'calc(100% - 64px)' : 'calc(100% - 32px)'
          }}
        />

        {/* Equipped Accessories - EXACT same structure as BeeAccessoriesCustomizer */}
        {character.equippedAccessories.map((equipped, index) => {
          const accessory = getAssetById(equipped.assetId);
          if (!accessory) return null;

          // CRITICAL FIX: Use EXACT same position logic as BeeAccessoriesCustomizer
          // Large preview (400px): raw positions (1.0 multiplier) - matches positioning view
          // Medium/Small preview: 0.5 multiplier - matches mini preview
          const scaledX = equipped.position.x * POSITION_MULTIPLIER;
          const scaledY = equipped.position.y * POSITION_MULTIPLIER;
          
          console.log(`🔍 ACCESSORY POSITION DEBUG - ${accessory.name}:`, {
            original: { x: equipped.position.x, y: equipped.position.y },
            scaled: { x: scaledX, y: scaledY },
            multiplier: POSITION_MULTIPLIER,
            size: size,
            container: config.className
          });

          return (
            <img
              key={equipped.assetId + index}
              src={accessory.filepath.startsWith('data:') ? accessory.filepath : `${accessory.filepath}?v=${Date.now()}`}
              alt={accessory.name}
              className={`absolute ${config.className} w-auto h-auto object-contain pointer-events-none`}
              style={{
                // EXACT same CSS structure as BeeAccessoriesCustomizer
                width: size === 'large' ? 'calc(100% - 64px)' : 'calc(100% - 32px)',
                height: size === 'large' ? 'calc(100% - 64px)' : 'calc(100% - 32px)',
                transform: `translate(${scaledX}px, ${scaledY}px) scale(${equipped.position.scale}) rotate(${equipped.position.rotation || 0}deg)`,
                opacity: equipped.position.opacity || 1,
                zIndex: 20
              }}
            />
          );
        })}
      </div>
    </div>
  );
}