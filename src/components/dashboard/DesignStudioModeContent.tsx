import React from 'react';
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
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CharacterPreview from '@/components/character/CharacterPreview';

interface DesignStudioModeContentProps {
  characterData?: any;
  coins: number;
  gems: number;
}

export default function DesignStudioModeContent({ characterData, coins, gems }: DesignStudioModeContentProps) {
  const navigate = useNavigate();

  // Mock popular shop items - in real app would come from assetManager
  const popularItems = [
    { name: 'Sparkle Glasses', price: 50, currency: 'coins', rarity: 'common' },
    { name: 'Crown Hat', price: 2, currency: 'gems', rarity: 'rare' },
    { name: 'Rainbow Wings', price: 100, currency: 'coins', rarity: 'epic' },
    { name: 'Magic Wand', price: 1, currency: 'gems', rarity: 'rare' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Display */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Your Character
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Character preview */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border-4 border-pink-200">
                {characterData ? (
                  <CharacterPreview character={characterData} />
                ) : (
                  <div className="text-4xl">🐝</div>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-pink-700">
                {characterData?.name || 'My Character'}
              </h3>
              <p className="text-sm text-pink-600">Looking stylish!</p>
            </div>

            {/* Character stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Accessories
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {characterData?.equippedAccessories?.length || 1}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Unlocked Items
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {characterData?.unlockedAssets?.length || 2}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-pink-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Style Level
                </span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  Trendy
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick customize buttons */}
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
              onClick={() => navigate('/design')}
            >
              <Eye className="w-4 h-4 mr-1" />
              Customize
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
              onClick={() => navigate('/design')}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Shop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Shop Items */}
      <Card className="bg-white/50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Popular in Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {popularItems.map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200"
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">
                    {index === 0 ? '👓' : index === 1 ? '👑' : index === 2 ? '🌈' : '🪄'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-700">{item.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {item.currency === 'coins' ? (
                        <span className="text-xs text-yellow-600">💰 {item.price}</span>
                      ) : (
                        <span className="text-xs text-purple-600">⭐ {item.price}</span>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRarityColor(item.rarity)}`}
                      >
                        {item.rarity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Studio Navigation */}
      <Card className="bg-gradient-to-r from-pink-400/20 to-rose-400/20 border-pink-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-pink-700">Full Design Studio</h3>
              <p className="text-sm text-pink-600">Access all customization tools and shop items</p>
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