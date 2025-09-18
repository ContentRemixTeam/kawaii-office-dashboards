import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { PNGCharacter, CharacterAsset, EquippedAccessory, AccessoryPosition } from '@/types/character';
import { getAssetsByType, getAssetsByCategory, getAssetById, getRarityColor } from '@/lib/assetManager';
import CharacterPreview from './CharacterPreview';
import AccessoryPositioner from './AccessoryPositioner';
import ProductivityRewards from './ProductivityRewards';
import { ShopItemCard } from './ShopItemCard';

interface CharacterCustomizationContentProps {
  character: PNGCharacter;
  allAssets: CharacterAsset[];
  selectedAccessory: EquippedAccessory | null;
  onCharacterChange: (character: PNGCharacter) => void;
  onCoinsEarned: (amount: number) => void;
  onSpecialCurrencyEarned: (amount: number) => void;
  onAccessorySelect: (accessory: EquippedAccessory | null) => void;
  onAssetsRefresh: () => void;
  canAfford: (asset: CharacterAsset) => boolean;
  isUnlocked: (assetId: string) => boolean;
  purchaseAsset: (asset: CharacterAsset) => void;
  equipAccessory: (assetId: string) => void;
  unequipAccessory: (assetId: string) => void;
  updateAccessoryPosition: (assetId: string, position: AccessoryPosition) => void;
  changeCharacterBase: (assetId: string) => void;
  updateCharacterName: (name: string) => void;
  isAccessoryEquipped: (assetId: string) => boolean;
}

export default function CharacterCustomizationContent({
  character,
  allAssets,
  selectedAccessory,
  onCharacterChange,
  onCoinsEarned,
  onSpecialCurrencyEarned,
  onAccessorySelect,
  onAssetsRefresh,
  canAfford,
  isUnlocked,
  purchaseAsset,
  equipAccessory,
  unequipAccessory,
  updateAccessoryPosition,
  changeCharacterBase,
  updateCharacterName,
  isAccessoryEquipped,
}) {

  return (
    <>
      {/* Character Tab */}
      <TabsContent value="character" className="p-6 space-y-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="character-name" className="theme-text-title font-semibold">Character Name</Label>
            <Input
              id="character-name"
              value={character.name}
              onChange={(e) => updateCharacterName(e.target.value)}
              placeholder="Enter character name"
              className="max-w-md theme-input mt-2"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold theme-text-title mb-4">Character Base</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getAssetsByType('base').map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => changeCharacterBase(asset.id)}
                  disabled={!isUnlocked(asset.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    character.baseAsset === asset.id
                      ? 'border-purple-400 theme-card theme-card-elevated scale-105'
                      : isUnlocked(asset.id)
                      ? 'theme-card hover:theme-card-elevated hover:scale-102'
                      : 'theme-card opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <img 
                      src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-bold theme-text-title">{asset.name}</div>
                  <Badge className={`mt-1 ${getRarityColor(asset.rarity)}`}>
                    {asset.rarity}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* My Closet Tab */}
      <TabsContent value="accessories" className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold theme-text-title mb-4">My Closet</h3>
          
          {/* Categories */}
          {['glasses', 'hats', 'clothing', 'pets'].map((category) => {
            const categoryAssets = getAssetsByCategory(category as CharacterAsset['category']).filter(asset => 
              isUnlocked(asset.id)
            );
            
            if (categoryAssets.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-bold theme-text-title capitalize flex items-center gap-2">
                  {category === 'glasses' && '👓'} 
                  {category === 'hats' && '👒'} 
                  {category === 'clothing' && '👕'} 
                  {category === 'pets' && '🐾'} 
                  {category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryAssets.map((asset) => (
                    <div key={asset.id} className="relative group">
                      <button
                        onClick={() => {
                          if (isAccessoryEquipped(asset.id)) {
                            unequipAccessory(asset.id);
                          } else {
                            equipAccessory(asset.id);
                          }
                        }}
                        className={`w-full h-48 p-1 rounded-2xl transition-all duration-300 ${
                          isAccessoryEquipped(asset.id)
                            ? 'bg-gradient-to-br from-blue-200 to-blue-300 shadow-lg scale-105'
                            : 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className="w-full h-full bg-white/90 rounded-xl p-4 flex flex-col items-center justify-center border border-blue-200/50">
                          <div className="w-28 h-28 mx-auto mb-3 relative">{/* Even bigger for glasses */}
                            <img 
                              src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                              alt={asset.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-sm font-bold text-gray-800 mb-1 truncate">{asset.name}</div>
                          <Badge className={`text-xs ${getRarityColor(asset.rarity)}`}>
                            {asset.rarity}
                          </Badge>
                        </div>
                      </button>
                      
                      {isAccessoryEquipped(asset.id) && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            const equipped = character.equippedAccessories.find(eq => eq.assetId === asset.id);
                            if (equipped) {
                              onAccessorySelect(equipped);
                            }
                          }}
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          Position
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      {/* Positioning Tab */}
      <TabsContent value="positioning" className="p-6 space-y-6">
        {selectedAccessory ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <CharacterPreview 
                character={character} 
                size="large" 
                showBackground={true}
                className="mx-auto"
              />
            </div>
            <div>
              <AccessoryPositioner
                position={selectedAccessory.position}
                onPositionChange={(position) => updateAccessoryPosition(selectedAccessory.assetId, position)}
                category={getAssetById(selectedAccessory.assetId)?.category}
                assetName={getAssetById(selectedAccessory.assetId)?.name}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 theme-card rounded-xl">
            <p className="theme-text-secondary mb-4 font-medium">Select an equipped accessory from My Closet to position it</p>
            <Button 
              onClick={() => onAccessorySelect(character.equippedAccessories[0] || null)}
              disabled={character.equippedAccessories.length === 0}
            >
              {character.equippedAccessories.length > 0 ? 'Select First Accessory' : 'No Accessories Equipped'}
            </Button>
          </div>
        )}
      </TabsContent>

      {/* Shop Tab */}
      <TabsContent value="shop" className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold theme-text-title mb-4">SHOP</h3>
          
          {/* Locked Assets */}
          {['base', 'accessory'].map((type) => {
            const lockedAssets = allAssets.filter(asset => 
              asset.type === type && !isUnlocked(asset.id)
            );
            
            if (lockedAssets.length === 0) return null;

            return (
              <div key={type} className="space-y-3">
                <h4 className="text-lg font-bold theme-text-title capitalize">{type === 'accessory' ? 'Accessories' : type + 's'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lockedAssets.map((asset) => (
                    <ShopItemCard
                      key={asset.id}
                      asset={asset}
                      onPurchase={() => purchaseAsset(asset)}
                      canAfford={canAfford(asset)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      {/* Rewards Tab */}
      <TabsContent value="rewards" className="p-6">
        <ProductivityRewards 
          onCoinsEarned={onCoinsEarned}
          onSpecialCurrencyEarned={onSpecialCurrencyEarned}
        />
      </TabsContent>
    </>
  );
}