import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Star, 
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Crown,
  Shirt,
  Eye,
  Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CharacterPreview from '@/components/character/CharacterPreview';
import { getAllAssets } from '@/lib/assetManager';
import type { PNGCharacter } from '@/types/character';

interface DesignStudioModeContentProps {
  coins: number;
  gems: number;
}

// Default character structure matching what's used in Design Studio
const DEFAULT_CHARACTER: PNGCharacter = {
  id: crypto.randomUUID(),
  name: 'My Character',
  baseAsset: 'bee-base',
  equippedAccessories: [],
  coins: 150,
  specialCurrency: 1,
  unlockedAssets: ['bee-base'],
  room: {
    background: 'default',
    decorations: []
  }
};

export default function DesignStudioModeContent({ coins, gems }: DesignStudioModeContentProps) {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<PNGCharacter>(DEFAULT_CHARACTER);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);

  // Load character data from localStorage (same as Design Studio)
  useEffect(() => {
    const saved = localStorage.getItem('png_character_v1');
    if (saved) {
      try {
        const loadedCharacter = JSON.parse(saved);
        setCharacter(loadedCharacter);
      } catch (error) {
        console.error('Failed to load character:', error);
      }
    }

    // Load available assets
    const assets = getAllAssets();
    const shopAssets = assets.filter(asset => !character.unlockedAssets.includes(asset.id)).slice(0, 4);
    setAvailableAssets(shopAssets);
  }, [character.unlockedAssets]);

  return (
    <div className="space-y-6">
      {/* Character Display */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Design Studio - Character Customization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Character preview */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border-4 border-pink-200 mb-4">
                <CharacterPreview 
                  character={character} 
                  size="small" 
                  showBackground={false}
                />
              </div>
              <h3 className="text-lg font-semibold text-pink-700 mb-2">
                {character.name}
              </h3>
              
              {/* Character currency display (matches Design Studio) */}
              <div className="flex justify-center gap-4 mb-3">
                <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-bold text-yellow-700">{character.coins}</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-700">{character.specialCurrency}</span>
                </div>
              </div>
            </div>

            {/* Character stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Equipped Accessories
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {character.equippedAccessories?.length || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Unlocked Items
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {character.unlockedAssets?.length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Base Character
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 capitalize">
                  {character.baseAsset.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick customize buttons */}
          <div className="mt-6 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
              onClick={() => navigate('/design')}
            >
              <Eye className="w-4 h-4 mr-1" />
              Customize Character
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
              onClick={() => navigate('/design')}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Browse Shop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shop Preview (Real assets from the actual shop) */}
      <Card className="bg-white/50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Available in Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableAssets.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availableAssets.map((asset, index) => (
                <div 
                  key={asset.id}
                  className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto bg-white rounded-lg flex items-center justify-center">
                      {/* Asset preview or icon */}
                      <div className="text-2xl">
                        {asset.category === 'accessories' ? '👓' : 
                         asset.category === 'hats' ? '👑' : 
                         asset.category === 'clothing' ? '👕' : '✨'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-700">{asset.name}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {asset.price || 50}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          {asset.rarity || 'common'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-pink-600">All available items unlocked!</p>
              <p className="text-sm text-pink-500">Visit the Design Studio to upload new assets</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Studio Navigation */}
      <Card className="bg-gradient-to-r from-pink-400/20 to-rose-400/20 border-pink-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-pink-700">Full Design Studio</h3>
              <p className="text-sm text-pink-600">Access all customization tools, shop, and asset uploads</p>
            </div>
            <Button 
              onClick={() => navigate('/design')}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Enter Studio
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}