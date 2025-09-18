import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  ShoppingCart, 
  Palette, 
  Settings, 
  Upload, 
  Coins,
  Star,
  RotateCw,
  Eye,
  Move,
  Zap
} from 'lucide-react';
import AssetUploader from '@/components/character/AssetUploader';
import { 
  getAllAssets, 
  getAssetsByCategory, 
  getAssetById, 
  getRarityColor 
} from '@/lib/assetManager';
import { CharacterAsset, PNGCharacter, AccessoryPosition, EquippedAccessory } from '@/types/character';

const DEFAULT_BEE_CHARACTER: PNGCharacter = {
  id: 'bee-customization',
  name: 'Your Bee',
  baseAsset: 'bee-base',
  equippedAccessories: [],
  coins: 500,
  specialCurrency: 50,
  unlockedAssets: ['bee-base', 'glasses-round'],
  room: {
    background: '',
    decorations: []
  }
};

export default function BeeAccessoriesCustomizer() {
  const [character, setCharacter] = useState<PNGCharacter>(DEFAULT_BEE_CHARACTER);
  const [allAssets, setAllAssets] = useState<CharacterAsset[]>([]);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('customization');

  // Load character and assets
  useEffect(() => {
    const stored = localStorage.getItem('bee_character_customization');
    if (stored) {
      try {
        setCharacter(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading character:', error);
      }
    }
    refreshAssets();
  }, []);

  const refreshAssets = () => {
    setAllAssets(getAllAssets());
  };

  const saveCharacter = (updatedCharacter: PNGCharacter) => {
    setCharacter(updatedCharacter);
    localStorage.setItem('bee_character_customization', JSON.stringify(updatedCharacter));
  };

  const canAfford = (asset: CharacterAsset): boolean => {
    return asset.currency === 'coins' 
      ? character.coins >= asset.price
      : character.specialCurrency >= asset.price;
  };

  const isUnlocked = (assetId: string): boolean => {
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

  const equipAccessory = (assetId: string) => {
    const asset = getAssetById(assetId);
    if (!asset || !isUnlocked(assetId)) return;

    const updatedCharacter = { ...character };
    const newAccessory: EquippedAccessory = {
      assetId,
      position: asset.defaultPosition || { x: 0, y: -15, scale: 0.85, rotation: 0, opacity: 1 }
    };

    // Remove existing accessory of same category if any
    if (asset.category) {
      updatedCharacter.equippedAccessories = updatedCharacter.equippedAccessories.filter(acc => {
        const accAsset = getAssetById(acc.assetId);
        return accAsset?.category !== asset.category;
      });
    }

    updatedCharacter.equippedAccessories.push(newAccessory);
    saveCharacter(updatedCharacter);
    setSelectedAccessory(assetId);
  };

  const unequipAccessory = (assetId: string) => {
    const updatedCharacter = { ...character };
    updatedCharacter.equippedAccessories = updatedCharacter.equippedAccessories.filter(
      acc => acc.assetId !== assetId
    );
    saveCharacter(updatedCharacter);
    if (selectedAccessory === assetId) {
      setSelectedAccessory(null);
    }
  };

  const updateAccessoryPosition = (assetId: string, position: AccessoryPosition) => {
    const updatedCharacter = { ...character };
    const accessoryIndex = updatedCharacter.equippedAccessories.findIndex(
      acc => acc.assetId === assetId
    );
    
    if (accessoryIndex !== -1) {
      updatedCharacter.equippedAccessories[accessoryIndex].position = position;
      saveCharacter(updatedCharacter);
    }
  };

  const lockAccessoryPosition = (assetId: string) => {
    const equippedAccessory = getEquippedAccessory(assetId);
    if (!equippedAccessory) return;

    // Save the current position as the default for store customers
    const asset = getAssetById(assetId);
    if (asset) {
      const updatedAsset = { ...asset, defaultPosition: equippedAccessory.position };
      const assets = getAllAssets();
      const assetIndex = assets.findIndex(a => a.id === assetId);
      if (assetIndex !== -1) {
        assets[assetIndex] = updatedAsset;
        localStorage.setItem('character_assets', JSON.stringify(assets));
        refreshAssets();
      }
    }
  };

  const isAccessoryEquipped = (assetId: string): boolean => {
    return character.equippedAccessories.some(acc => acc.assetId === assetId);
  };

  const getEquippedAccessory = (assetId: string): EquippedAccessory | undefined => {
    return character.equippedAccessories.find(acc => acc.assetId === assetId);
  };

  const handleAssetAdded = (asset: CharacterAsset) => {
    const updatedCharacter = { ...character };
    updatedCharacter.unlockedAssets.push(asset.id);
    saveCharacter(updatedCharacter);
    refreshAssets();
  };

  const accessories = getAssetsByCategory('glasses')
    .concat(getAssetsByCategory('hats'))
    .concat(getAssetsByCategory('clothing'))
    .concat(getAssetsByCategory('pets'));

  const lockedAccessories = accessories.filter(asset => !isUnlocked(asset.id));
  const unlockedAccessories = accessories.filter(asset => isUnlocked(asset.id));

  const selectedAccessoryData = selectedAccessory ? getAssetById(selectedAccessory) : null;
  const selectedEquippedAccessory = selectedAccessory ? getEquippedAccessory(selectedAccessory) : null;

  const presets = [
    { name: "Default", x: 0, y: -15, scale: 0.85, rotation: 0, opacity: 1 },
    { name: "Higher", x: 0, y: -25, scale: 0.8, rotation: 0, opacity: 1 },
    { name: "Lower", x: 0, y: -5, scale: 0.9, rotation: 0, opacity: 1 },
    { name: "Smaller", x: 0, y: -15, scale: 0.7, rotation: 0, opacity: 1 },
    { name: "Tilted", x: 0, y: -15, scale: 0.85, rotation: 15, opacity: 1 },
    { name: "Faded", x: 0, y: -15, scale: 0.85, rotation: 0, opacity: 0.7 }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            🐝 Bee Accessories Studio
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Coins className="w-4 h-4 mr-1" />
              {character.coins}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Star className="w-4 h-4 mr-1" />
              {character.specialCurrency}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {/* Large Preview */}
                <div className="relative mx-auto bg-muted/20 p-8 rounded-lg" style={{ width: '400px', height: '400px' }}>
                  <img 
                    src={`/characters/bases/bee/bee-base.png?v=${Date.now()}`}
                    alt="Your bee character"
                    className="absolute inset-8 w-auto h-auto object-contain"
                    style={{ 
                      width: 'calc(100% - 64px)',
                      height: 'calc(100% - 64px)'
                    }}
                  />
                  {character.equippedAccessories.map((equippedAcc) => {
                    const asset = getAssetById(equippedAcc.assetId);
                    if (!asset) return null;
                    
                    return (
                      <img 
                        key={asset.id}
                        src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                        alt={asset.name}
                        className={`absolute inset-8 w-auto h-auto object-contain pointer-events-none ${
                          selectedAccessory === asset.id ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{ 
                          width: 'calc(100% - 64px)',
                          height: 'calc(100% - 64px)',
                          transform: `translate(${equippedAcc.position.x}px, ${equippedAcc.position.y}px) scale(${equippedAcc.position.scale}) rotate(${equippedAcc.position.rotation || 0}deg)`,
                          opacity: equippedAcc.position.opacity || 1
                        }}
                      />
                    );
                  })}
                </div>

                {/* Mini App Preview */}
                <div className="relative mx-auto p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src={`/characters/bases/bee/bee-base.png?v=${Date.now()}`}
                    alt="App preview"
                    className="absolute inset-4 w-auto h-auto object-contain"
                    style={{ 
                      width: 'calc(100% - 32px)',
                      height: 'calc(100% - 32px)'
                    }}
                  />
                  {character.equippedAccessories.map((equippedAcc) => {
                    const asset = getAssetById(equippedAcc.assetId);
                    if (!asset) return null;
                    
                    return (
                      <img 
                        key={`mini-${asset.id}`}
                        src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                        alt=""
                        className="absolute inset-4 w-auto h-auto object-contain pointer-events-none"
                        style={{ 
                          width: 'calc(100% - 32px)',
                          height: 'calc(100% - 32px)',
                          transform: `translate(${equippedAcc.position.x * 0.5}px, ${equippedAcc.position.y * 0.5}px) scale(${equippedAcc.position.scale}) rotate(${equippedAcc.position.rotation || 0}deg)`,
                          opacity: equippedAcc.position.opacity || 1
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground">How it looks in the app</p>
              </div>
            </CardContent>
          </Card>

          {/* Customization Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Customization Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="customization" className="text-xs">
                    <Palette className="w-4 h-4 mr-1" />
                    Equip
                  </TabsTrigger>
                  <TabsTrigger value="positioning" className="text-xs">
                    <Settings className="w-4 h-4 mr-1" />
                    Position
                  </TabsTrigger>
                  <TabsTrigger value="shop" className="text-xs">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Shop
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="customization" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Your Accessories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {unlockedAccessories.map((asset) => (
                        <div key={asset.id} className="border rounded-lg p-3 text-center">
                          <img 
                            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                            alt={asset.name}
                            className="w-12 h-12 object-contain mx-auto mb-2"
                          />
                          <p className="text-xs font-medium mb-2">{asset.name}</p>
                          <div className="flex gap-1">
                            {isAccessoryEquipped(asset.id) ? (
                              <>
                                <Button 
                                  onClick={() => unequipAccessory(asset.id)}
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 text-xs"
                                >
                                  Remove
                                </Button>
                                <Button 
                                  onClick={() => setSelectedAccessory(asset.id)}
                                  variant={selectedAccessory === asset.id ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs"
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={() => equipAccessory(asset.id)}
                                size="sm"
                                className="w-full text-xs"
                              >
                                Equip
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="positioning" className="space-y-4">
                  {selectedAccessoryData && selectedEquippedAccessory ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedAccessoryData.filepath.startsWith('data:') ? selectedAccessoryData.filepath : `${selectedAccessoryData.filepath}?v=${Date.now()}`}
                          alt={selectedAccessoryData.name}
                          className="w-8 h-8 object-contain"
                        />
                        <h3 className="font-medium">{selectedAccessoryData.name}</h3>
                      </div>

                      {/* Position Controls */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Move className="w-4 h-4" />
                            X Position: {selectedEquippedAccessory.position.x}px
                          </label>
                          <Slider
                            value={[selectedEquippedAccessory.position.x]}
                            onValueChange={([x]) => updateAccessoryPosition(selectedAccessory!, { 
                              ...selectedEquippedAccessory.position, 
                              x 
                            })}
                            min={-50}
                            max={50}
                            step={1}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Move className="w-4 h-4 rotate-90" />
                            Y Position: {selectedEquippedAccessory.position.y}px
                          </label>
                          <Slider
                            value={[selectedEquippedAccessory.position.y]}
                            onValueChange={([y]) => updateAccessoryPosition(selectedAccessory!, { 
                              ...selectedEquippedAccessory.position, 
                              y 
                            })}
                            min={-50}
                            max={50}
                            step={1}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Scale: {Math.round(selectedEquippedAccessory.position.scale * 100)}%
                          </label>
                          <Slider
                            value={[selectedEquippedAccessory.position.scale]}
                            onValueChange={([scale]) => updateAccessoryPosition(selectedAccessory!, { 
                              ...selectedEquippedAccessory.position, 
                              scale 
                            })}
                            min={0.3}
                            max={1.5}
                            step={0.05}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <RotateCw className="w-4 h-4" />
                            Rotation: {selectedEquippedAccessory.position.rotation || 0}°
                          </label>
                          <Slider
                            value={[selectedEquippedAccessory.position.rotation || 0]}
                            onValueChange={([rotation]) => updateAccessoryPosition(selectedAccessory!, { 
                              ...selectedEquippedAccessory.position, 
                              rotation 
                            })}
                            min={-45}
                            max={45}
                            step={1}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Opacity: {Math.round((selectedEquippedAccessory.position.opacity || 1) * 100)}%
                          </label>
                          <Slider
                            value={[selectedEquippedAccessory.position.opacity || 1]}
                            onValueChange={([opacity]) => updateAccessoryPosition(selectedAccessory!, { 
                              ...selectedEquippedAccessory.position, 
                              opacity 
                            })}
                            min={0.1}
                            max={1}
                            step={0.05}
                          />
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <h4 className="font-medium mb-2">Quick Presets</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {presets.map((preset) => (
                            <Button
                              key={preset.name}
                              onClick={() => updateAccessoryPosition(selectedAccessory!, preset)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Lock Position Button */}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => lockAccessoryPosition(selectedAccessory!)}
                          className="w-full"
                          size="sm"
                        >
                          🔒 Lock Position for Store
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Customers will get this accessory in this exact position
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select an equipped accessory to position it</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="shop" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Available Accessories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {lockedAccessories.map((asset) => (
                        <div key={asset.id} className={`border-2 rounded-lg p-3 text-center ${getRarityColor(asset.rarity)}`}>
                          <img 
                            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                            alt={asset.name}
                            className="w-12 h-12 object-contain mx-auto mb-2"
                          />
                          <p className="text-xs font-medium mb-1">{asset.name}</p>
                          <Badge className={getRarityColor(asset.rarity)} variant="outline">
                            {asset.rarity}
                          </Badge>
                          <div className="flex items-center justify-center gap-1 my-2 text-xs">
                            {asset.currency === 'coins' ? <Coins className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                            {asset.price}
                          </div>
                          <Button 
                            onClick={() => purchaseAsset(asset)}
                            disabled={!canAfford(asset)}
                            size="sm"
                            className="w-full text-xs"
                          >
                            {canAfford(asset) ? 'Buy' : 'Can\'t Afford'}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {lockedAccessories.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>All accessories unlocked!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <AssetUploader onAssetAdded={handleAssetAdded} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}