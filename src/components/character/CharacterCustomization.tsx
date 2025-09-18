import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette,
  Sparkles,
  Heart,
  Star,
  Crown,
  Shirt,
  Home,
  ArrowLeft,
  Coins,
  ShoppingBag,
  Smile,
  Eye,
  User,
  Gift,
  Upload,
  Settings,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductivityRewards from './ProductivityRewards';
import CharacterPreview from './CharacterPreview';
import CharacterCustomizationContent from './CharacterCustomizationContent';
import { PNGCharacter, CharacterAsset, EquippedAccessory, AccessoryPosition } from '@/types/character';
import { getAllAssets, getAssetsByType, getAssetsByCategory, getAssetById, getRarityColor } from '@/lib/assetManager';

// Legacy character interface kept for migration
interface LegacyCharacter {
  id: string;
  name: string;
  type: 'human' | 'cat' | 'fairy' | 'bear';
  appearance: {
    skinColor: string;
    hairStyle: string;
    hairColor: string;
    eyeShape: string;
    eyeColor: string;
    expression: string;
    outfit: {
      top: string;
      bottom: string;
      accessory: string;
    };
  };
  room: {
    background: string;
    furniture: string[];
    decorations: string[];
  };
  coins: number;
  specialCurrency: number;
  unlockedItems: string[];
}

// Default PNG character setup
const DEFAULT_PNG_CHARACTER: PNGCharacter = {
  id: crypto.randomUUID(),
  name: 'My Character',
  baseAsset: 'bee-base',
  equippedAccessories: [
    {
      assetId: 'glasses-round',
      position: { x: 0, y: -15, scale: 0.85, rotation: 0, opacity: 1 }
    }
  ],
  coins: 150,
  specialCurrency: 1,
  unlockedAssets: ['bee-base', 'glasses-round'],
  room: {
    background: 'default',
    decorations: []
  }
};

interface CharacterCustomizationProps {
  onBack: () => void;
}

export default function CharacterCustomization({ onBack }: CharacterCustomizationProps) {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<PNGCharacter>(DEFAULT_PNG_CHARACTER);
  const [selectedTab, setSelectedTab] = useState<'character' | 'accessories' | 'positioning' | 'shop' | 'upload' | 'rewards'>('character');
  const [selectedAccessory, setSelectedAccessory] = useState<EquippedAccessory | null>(null);
  const [allAssets, setAllAssets] = useState<CharacterAsset[]>([]);

  // Load character from localStorage and refresh assets
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
    
    // Load all available assets
    setAllAssets(getAllAssets());
  }, []);

  // Refresh assets when new ones are added
  const refreshAssets = () => {
    setAllAssets(getAllAssets());
  };

  // Save character to localStorage
  const saveCharacter = (updatedCharacter: PNGCharacter) => {
    setCharacter(updatedCharacter);
    localStorage.setItem('png_character_v1', JSON.stringify(updatedCharacter));
  };

  const canAfford = (asset: CharacterAsset) => {
    if (asset.currency === 'coins') {
      return character.coins >= asset.price;
    }
    return character.specialCurrency >= asset.price;
  };

  const isUnlocked = (assetId: string) => {
    return character.unlockedAssets.includes(assetId);
  };

  const purchaseAsset = (asset: CharacterAsset) => {
    if (!canAfford(asset) || isUnlocked(asset.id)) return;

    const updatedCharacter = { ...character };
    
    if (asset.currency === 'coins') {
      updatedCharacter.coins -= asset.price;
    } else {
      updatedCharacter.specialCurrency -= asset.price;
    }
    
    updatedCharacter.unlockedAssets.push(asset.id);
    saveCharacter(updatedCharacter);
  };

  const handleCoinsEarned = (amount: number) => {
    const updatedCharacter = {
      ...character,
      coins: character.coins + amount
    };
    saveCharacter(updatedCharacter);
  };

  const handleSpecialCurrencyEarned = (amount: number) => {
    const updatedCharacter = {
      ...character,
      specialCurrency: character.specialCurrency + amount
    };
    saveCharacter(updatedCharacter);
  };

  const equipAccessory = (assetId: string) => {
    if (!isUnlocked(assetId)) return;
    
    const asset = getAssetById(assetId);
    if (!asset || asset.type !== 'accessory') return;

    const updatedCharacter = { ...character };
    const newAccessory: EquippedAccessory = {
      assetId,
      position: asset.defaultPosition || { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }
    };

    updatedCharacter.equippedAccessories.push(newAccessory);
    saveCharacter(updatedCharacter);
  };

  const unequipAccessory = (assetId: string) => {
    const updatedCharacter = { ...character };
    updatedCharacter.equippedAccessories = updatedCharacter.equippedAccessories.filter(
      eq => eq.assetId !== assetId
    );
    saveCharacter(updatedCharacter);
  };

  const updateAccessoryPosition = (assetId: string, position: AccessoryPosition) => {
    const updatedCharacter = { ...character };
    const accessoryIndex = updatedCharacter.equippedAccessories.findIndex(eq => eq.assetId === assetId);
    
    if (accessoryIndex !== -1) {
      updatedCharacter.equippedAccessories[accessoryIndex].position = position;
      saveCharacter(updatedCharacter);
    }
  };

  const changeCharacterBase = (assetId: string) => {
    if (!isUnlocked(assetId)) return;
    
    const asset = getAssetById(assetId);
    if (!asset || asset.type !== 'base') return;

    const updatedCharacter = { ...character };
    updatedCharacter.baseAsset = assetId;
    saveCharacter(updatedCharacter);
  };

  const updateCharacterName = (name: string) => {
    const updatedCharacter = { ...character };
    updatedCharacter.name = name;
    saveCharacter(updatedCharacter);
  };

  const isAccessoryEquipped = (assetId: string) => {
    return character.equippedAccessories.some(eq => eq.assetId === assetId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="bg-white/90 border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm rounded-full px-6 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office
            </Button>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-4">
                <Heart className="w-10 h-10 text-pink-400" />
                CHARACTER MODE
              </h1>
              <p className="text-gray-700 mt-3 text-lg font-medium">
                Customize your kawaii character with productivity rewards! ✨
              </p>
            </div>
          </div>
          
          {/* Currency Display */}
          <div className="flex gap-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-lg">
              <Coins className="w-5 h-5" />
              {character.coins}
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-lg">
              <Star className="w-5 h-5" />
              {character.specialCurrency}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-gray-800 font-bold text-xl flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {character.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Character Preview */}
                <CharacterPreview 
                  character={character} 
                  size="medium" 
                  showBackground={true}
                />
                
                {/* Character Info */}
                <div className="mt-4 text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">{character.name}</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full font-semibold text-sm">
                      {getAssetById(character.baseAsset)?.name || 'Unknown Base'}
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm">
                      {character.equippedAccessories.length} accessories
                    </div>
                  </div>
                </div>
                
                {/* Equipped Accessories List */}
                <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-purple-500" />
                    Equipped Accessories
                  </h4>
                  {character.equippedAccessories.length > 0 ? (
                    <div className="space-y-3">
                      {character.equippedAccessories.map((equipped, index) => {
                        const asset = getAssetById(equipped.assetId);
                        return (
                          <div key={index} className="flex items-center justify-between text-base bg-white rounded-lg p-3 shadow-sm">
                            <span className="font-medium text-gray-800">{asset?.name || 'Unknown'}</span>
                            <Badge className={getRarityColor(asset?.rarity || 'common')}>
                              {asset?.rarity || 'common'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base text-gray-600 font-medium">No accessories equipped</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Tabs */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
                  <TabsList className="grid w-full grid-cols-6 bg-gray-50 p-2 rounded-2xl">
                    <TabsTrigger value="character" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <User className="w-4 h-4 mr-2" />
                      Character
                    </TabsTrigger>
                    <TabsTrigger value="accessories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <Shirt className="w-4 h-4 mr-2" />
                      Accessories
                    </TabsTrigger>
                    <TabsTrigger value="positioning" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <Settings className="w-4 h-4 mr-2" />
                      Positioning
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white font-semibold rounded-xl transition-all duration-300">
                      <Gift className="w-4 h-4 mr-2" />
                      Rewards
                    </TabsTrigger>
                  </TabsList>

                  <CharacterCustomizationContent
                    character={character}
                    allAssets={allAssets}
                    selectedAccessory={selectedAccessory}
                    onCharacterChange={saveCharacter}
                    onCoinsEarned={handleCoinsEarned}
                    onSpecialCurrencyEarned={handleSpecialCurrencyEarned}
                    onAccessorySelect={setSelectedAccessory}
                    onAssetsRefresh={refreshAssets}
                    canAfford={canAfford}
                    isUnlocked={isUnlocked}
                    purchaseAsset={purchaseAsset}
                    equipAccessory={equipAccessory}
                    unequipAccessory={unequipAccessory}
                    updateAccessoryPosition={updateAccessoryPosition}
                    changeCharacterBase={changeCharacterBase}
                    updateCharacterName={updateCharacterName}
                    isAccessoryEquipped={isAccessoryEquipped}
                  />
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}