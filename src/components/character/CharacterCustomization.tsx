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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="bg-white/90 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3 font-cinzel">
                <Heart className="w-8 h-8 text-purple-600" />
                Character Mode
              </h1>
              <p className="text-slate-700 mt-2 font-semibold">
                Customize your kawaii character with productivity rewards!
              </p>
            </div>
          </div>
          
          {/* Currency Display */}
          <div className="flex gap-4">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-lg px-4 py-2 font-semibold">
              <Coins className="w-4 h-4 mr-2" />
              {character.coins} Coins
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-lg px-4 py-2 font-semibold">
              <Star className="w-4 h-4 mr-2" />
              {character.specialCurrency} Special
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800 font-cinzel flex items-center gap-2 font-bold">
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
                  <h3 className="text-lg font-bold text-slate-800">{character.name}</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge className="bg-purple-100 text-purple-800 font-semibold">
                      {getAssetById(character.baseAsset)?.name || 'Unknown Base'}
                    </Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 font-semibold">
                      {character.equippedAccessories.length} accessories
                    </Badge>
                  </div>
                </div>
                
                {/* Equipped Accessories List */}
                <div className="mt-6 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1">
                    <Shirt className="w-4 h-4" />
                    Equipped Accessories
                  </h4>
                  {character.equippedAccessories.length > 0 ? (
                    <div className="space-y-2">
                      {character.equippedAccessories.map((equipped, index) => {
                        const asset = getAssetById(equipped.assetId);
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{asset?.name || 'Unknown'}</span>
                            <Badge className={getRarityColor(asset?.rarity || 'common')}>
                              {asset?.rarity || 'common'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No accessories equipped</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Tabs */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardContent className="p-0">
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
                  <TabsList className="grid w-full grid-cols-6 bg-slate-50">
                    <TabsTrigger value="character" className="data-[state=active]:bg-purple-200 font-semibold">
                      <User className="w-4 h-4 mr-2" />
                      Character
                    </TabsTrigger>
                    <TabsTrigger value="accessories" className="data-[state=active]:bg-purple-200 font-semibold">
                      <Shirt className="w-4 h-4 mr-2" />
                      Accessories
                    </TabsTrigger>
                    <TabsTrigger value="positioning" className="data-[state=active]:bg-purple-200 font-semibold">
                      <Settings className="w-4 h-4 mr-2" />
                      Positioning
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="data-[state=active]:bg-purple-200 font-semibold">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="data-[state=active]:bg-purple-200 font-semibold">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-200 font-semibold">
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