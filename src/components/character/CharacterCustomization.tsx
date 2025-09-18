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
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductivityRewards from './ProductivityRewards';
import CharacterPreview from './CharacterPreview';
import CharacterCustomizationContent from './CharacterCustomizationContent';
import { PNGCharacter, CharacterAsset, EquippedAccessory, AccessoryPosition } from '@/types/character';
import { getAllAssets, getAssetsByType, getAssetsByCategory, getAssetById, getRarityColor, DEFAULT_POSITIONS, removeAssetsByPattern } from '@/lib/assetManager';

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
  const [selectedTab, setSelectedTab] = useState<'character' | 'accessories' | 'positioning' | 'shop' | 'rewards'>('character');
  const [selectedAccessory, setSelectedAccessory] = useState<EquippedAccessory | null>(null);
  const [allAssets, setAllAssets] = useState<CharacterAsset[]>([]);

  // Load character from localStorage and refresh assets
  useEffect(() => {
    const saved = localStorage.getItem('png_character_v1');
    if (saved) {
      try {
        const loadedCharacter = JSON.parse(saved);
        
        // Clean up removed assets (Baseball Cap and any Bee Cap variants)
        const cleanedCharacter = {
          ...loadedCharacter,
          unlockedAssets: loadedCharacter.unlockedAssets?.filter((assetId: string) => 
            assetId !== 'baseball-cap' && !assetId.toLowerCase().includes('bee') || assetId === 'bee-base'
          ) || [],
          equippedAccessories: loadedCharacter.equippedAccessories?.filter((equipped: any) => 
            equipped.assetId !== 'baseball-cap' && !equipped.assetId.toLowerCase().includes('bee') || equipped.assetId === 'bee-base'
          ) || []
        };
        
        setCharacter(cleanedCharacter);
        saveCharacter(cleanedCharacter); // Save the cleaned version
      } catch (error) {
        console.error('Failed to load character:', error);
      }
    }
    
    // Clean up specific removed assets
    removeAssetsByPattern(/bee.*cap|baseball.*cap/i);
    
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
    
    // Use asset's default position, or category default, or fallback
    let defaultPosition = asset.defaultPosition;
    if (!defaultPosition && asset.category) {
      defaultPosition = DEFAULT_POSITIONS[asset.category];
    }
    if (!defaultPosition) {
      defaultPosition = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
    }
    
    const newAccessory: EquippedAccessory = {
      assetId,
      position: defaultPosition
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
    <div className="min-h-screen theme-bg-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="theme-button-outline rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office
            </Button>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold theme-text-title flex items-center gap-4">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />
                DESIGN STUDIO
              </h1>
              <p className="theme-text-secondary mt-2 text-sm md:text-lg">
                Customize your character with productivity rewards! ✨
              </p>
            </div>
          </div>
          
          {/* Currency Display */}
          <div className="flex gap-4">
            <div className="theme-card border-2 border-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="theme-text-title">{character.coins}</span>
            </div>
            <div className="theme-card border-2 border-purple-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="theme-text-title">{character.specialCurrency}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="theme-card theme-card-elevated">
              <CardHeader>
                <CardTitle className="theme-text-title font-bold flex items-center gap-2">
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
                  <h3 className="text-xl font-bold theme-text-title">{character.name}</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <div className="theme-card border border-purple-300 text-purple-700 px-3 py-1 rounded-full font-semibold text-sm">
                      {getAssetById(character.baseAsset)?.name || 'Unknown Base'}
                    </div>
                    <div className="theme-card border border-blue-300 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">
                      {character.equippedAccessories.length} accessories
                    </div>
                  </div>
                </div>
                
                {/* Equipped Accessories List */}
                <div className="mt-6 theme-card-glass rounded-xl p-4">
                  <h4 className="text-base font-bold theme-text-title mb-3 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-purple-500" />
                    Equipped Accessories
                  </h4>
                  {character.equippedAccessories.length > 0 ? (
                    <div className="space-y-2">
                      {character.equippedAccessories.map((equipped, index) => {
                        const asset = getAssetById(equipped.assetId);
                        return (
                          <div key={index} className="flex items-center justify-between theme-card p-2 rounded-lg">
                            <span className="font-medium theme-text-title text-sm">{asset?.name || 'Unknown'}</span>
                            <Badge className={getRarityColor(asset?.rarity || 'common')}>
                              {asset?.rarity || 'common'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm theme-text-secondary font-medium">No accessories equipped</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Tabs */}
          <div className="lg:col-span-2">
            <Card className="theme-card theme-card-elevated">
              <CardContent className="p-0">
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
                  <TabsList className="grid w-full grid-cols-5 theme-bg-secondary p-2 rounded-t-xl">
                    <TabsTrigger value="character" className="data-[state=active]:theme-bg-primary data-[state=active]:theme-text-title theme-text-secondary font-semibold rounded-lg transition-all duration-300">
                      <User className="w-4 h-4 mr-2" />
                      Character
                    </TabsTrigger>
                    <TabsTrigger value="accessories" className="data-[state=active]:theme-bg-primary data-[state=active]:theme-text-title theme-text-secondary font-semibold rounded-lg transition-all duration-300">
                      <Shirt className="w-4 h-4 mr-2" />
                      My Closet
                    </TabsTrigger>
                    <TabsTrigger value="positioning" className="data-[state=active]:theme-bg-primary data-[state=active]:theme-text-title theme-text-secondary font-semibold rounded-lg transition-all duration-300">
                      <Settings className="w-4 h-4 mr-2" />
                      Positioning
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="data-[state=active]:theme-bg-primary data-[state=active]:theme-text-title theme-text-secondary font-semibold rounded-lg transition-all duration-300">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="data-[state=active]:theme-bg-primary data-[state=active]:theme-text-title theme-text-secondary font-semibold rounded-lg transition-all duration-300">
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