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
    <div className="body-gradient min-h-screen">
      {/* Dashboard Container */}
      <div className="dashboard-responsive-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="flex items-center justify-between w-full max-w-4xl">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-foreground hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">DESIGN STUDIO</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-foreground">{character.coins}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-foreground">{character.specialCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Grid - Character Preview & Customization */}
        <div className="dashboard-primary-grid">
          {/* Character Preview Column */}
          <div className="dashboard-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {character.name}
            </h2>
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 flex items-center justify-center mb-4">
              <CharacterPreview character={character} />
            </div>
            
            {/* Character Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {getAssetById(character.baseAsset)?.name || 'Unknown Base'}
                </div>
                <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  {character.equippedAccessories.length} accessories
                </div>
              </div>
              
              {/* Equipped Accessories */}
              {character.equippedAccessories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Shirt className="w-4 h-4" />
                    Equipped Items
                  </h3>
                  {character.equippedAccessories.map((equipped, index) => {
                    const asset = getAssetById(equipped.assetId);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                        <span className="text-xs text-muted-foreground">{asset?.name || 'Unknown'}</span>
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

          {/* Customization Content Column */}
          <div className="dashboard-card">
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
              <div className="border-b border-border/50">
                <TabsList className="grid w-full grid-cols-5 bg-background/50">
                  <TabsTrigger value="character" className="text-xs">Character</TabsTrigger>
                  <TabsTrigger value="accessories" className="text-xs">My Closet</TabsTrigger>
                  <TabsTrigger value="positioning" className="text-xs">Positioning</TabsTrigger>
                  <TabsTrigger value="shop" className="text-xs">Shop</TabsTrigger>
                  <TabsTrigger value="rewards" className="text-xs">Rewards</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
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
  );
}