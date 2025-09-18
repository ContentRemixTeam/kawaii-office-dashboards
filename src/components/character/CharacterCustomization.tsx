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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={onBack}
              className="text-foreground hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Palette className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">DESIGN STUDIO</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 bg-yellow-500/20 px-6 py-3 rounded-full border-2 border-yellow-400">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-foreground">{character.coins}</span>
            </div>
            <div className="flex items-center space-x-3 bg-purple-500/20 px-6 py-3 rounded-full border-2 border-purple-400">
              <Star className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-foreground">{character.specialCurrency}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Preview Column */}
          <div className="lg:col-span-1">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-3">
                <User className="w-6 h-6" />
                {character.name}
              </h2>
              
              {/* Large Character Preview */}
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 flex items-center justify-center mb-6">
                <div className="scale-150">
                  <CharacterPreview character={character} />
                </div>
              </div>
              
              {/* Character Info */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                    {getAssetById(character.baseAsset)?.name || 'Unknown Base'}
                  </div>
                  <div className="px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-semibold">
                    {character.equippedAccessories.length} accessories
                  </div>
                </div>
                
                {/* Equipped Accessories */}
                {character.equippedAccessories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                      <Shirt className="w-5 h-5" />
                      Equipped Items
                    </h3>
                    {character.equippedAccessories.map((equipped, index) => {
                      const asset = getAssetById(equipped.assetId);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-background/60 rounded-xl">
                          <span className="text-sm font-medium text-muted-foreground">{asset?.name || 'Unknown'}</span>
                          <Badge variant="secondary" className="text-xs">
                            {asset?.rarity || 'common'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customization Content Column */}
          <div className="lg:col-span-2">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
              <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
                <div className="border-b border-border/50 bg-background/30">
                  <TabsList className="grid w-full grid-cols-5 bg-transparent h-16">
                    <TabsTrigger value="character" className="text-sm font-semibold data-[state=active]:bg-primary/20">
                      <User className="w-4 h-4 mr-2" />
                      Character
                    </TabsTrigger>
                    <TabsTrigger value="accessories" className="text-sm font-semibold data-[state=active]:bg-primary/20">
                      <Shirt className="w-4 h-4 mr-2" />
                      My Closet
                    </TabsTrigger>
                    <TabsTrigger value="positioning" className="text-sm font-semibold data-[state=active]:bg-primary/20">
                      <Settings className="w-4 h-4 mr-2" />
                      Positioning
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="text-sm font-semibold data-[state=active]:bg-primary/20">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="text-sm font-semibold data-[state=active]:bg-primary/20">
                      <Gift className="w-4 h-4 mr-2" />
                      Rewards
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-8">
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
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}