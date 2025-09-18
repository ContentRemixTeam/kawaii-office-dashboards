import React from 'react';
import { Button } from '@/components/ui/button';
import roundGlassesCard from '@/assets/shop/round-glasses-card.png';
import baseballCapCard from '@/assets/shop/baseball-cap-card.png';

interface ShopItemCardProps {
  asset: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    price: number;
    currency: string;
    filepath: string;
  };
  onPurchase: () => void;
  canAfford: boolean;
}

// Map asset names to shop card graphics
const SHOP_CARD_GRAPHICS: Record<string, string> = {
  'Round Glasses': roundGlassesCard,
  'Baseball Cap': baseballCapCard,
};

export function ShopItemCard({ asset, onPurchase, canAfford }: ShopItemCardProps) {
  const shopCardGraphic = SHOP_CARD_GRAPHICS[asset.name];
  
  // Debug logging
  console.log('ShopItemCard:', { assetName: asset.name, shopCardGraphic, hasGraphic: !!shopCardGraphic });
  // If we have a custom shop card graphic, use it
  if (shopCardGraphic) {
    return (
      <div className="relative">
        <img 
          src={shopCardGraphic}
          alt={`${asset.name} shop card`}
          className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={canAfford ? onPurchase : undefined}
          style={{ filter: canAfford ? 'none' : 'grayscale(50%) opacity(0.7)' }}
        />
        {!canAfford && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <span className="text-white font-bold">Insufficient Coins</span>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback to original design for items without custom graphics
  return (
    <div className="relative">
      <div className={`p-4 rounded-xl border-2 bg-white shadow-sm`}>
        <div className="w-24 h-24 mx-auto mb-2 relative">
          <img 
            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
            alt={asset.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-base font-bold text-gray-800 text-center">{asset.name}</div>
        <div className="text-sm text-gray-600 text-center">{asset.rarity}</div>
        <div className="mt-2 text-center">
          <Button
            onClick={onPurchase}
            disabled={!canAfford}
            size="sm"
            className="w-full"
          >
            {asset.price} {asset.currency}
          </Button>
        </div>
      </div>
    </div>
  );
}