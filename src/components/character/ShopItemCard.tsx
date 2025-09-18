import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
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
    <div className="relative group cursor-pointer transition-all duration-300">
      <div className="dashboard-card overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
          <img 
            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
            alt={asset.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-card-foreground truncate">{asset.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{asset.rarity}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-card-foreground">{asset.price}</span>
            </div>
            
            {canAfford ? (
              <Button
                size="sm"
                onClick={onPurchase}
                className="text-xs"
              >
                Buy
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">
                Not enough coins
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}