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
import AssetUploader from './AssetUploader';
import ProductivityRewards from './ProductivityRewards';

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
  isAccessoryEquipped
}: CharacterCustomizationContentProps) {

  return (
    <>
      {/* Character Tab */}
      <TabsContent value="character" className="p-8 space-y-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
        <div className="space-y-6">
          <div>
            <Label htmlFor="character-name" className="text-gray-800 font-semibold">Character Name</Label>
            <Input
              id="character-name"
              value={character.name}
              onChange={(e) => updateCharacterName(e.target.value)}
              placeholder="Enter character name"
              className="max-w-md bg-white/20 backdrop-blur-sm border-white/30 rounded-xl text-gray-800 font-medium"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Character Base</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getAssetsByType('base').map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => changeCharacterBase(asset.id)}
                  disabled={!isUnlocked(asset.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    character.baseAsset === asset.id
                      ? 'border-purple-200/30 bg-gradient-to-br from-purple-50/20 to-pink-50/20 shadow-sm scale-105'
                      : isUnlocked(asset.id)
                      ? 'border-white/20 bg-white/15 hover:border-purple-100/30 hover:shadow-sm hover:scale-102'
                      : 'border-gray-200/20 bg-gray-50/15 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-20 h-20 mx-auto mb-2 relative">
                    <img 
                      src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-base font-bold text-gray-800">{asset.name}</div>
                  {!isUnlocked(asset.id) && (
                    <div className="text-sm text-gray-600 mt-2 font-medium">
                      {asset.price} {asset.currency}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Accessories Tab */}
      <TabsContent value="accessories" className="p-8 space-y-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Available Accessories</h3>
          
          {/* Categories */}
          {['glasses', 'hats', 'clothing', 'pets'].map((category) => {
            const categoryAssets = getAssetsByCategory(category as CharacterAsset['category']).filter(asset => 
              isUnlocked(asset.id)
            );
            
            if (categoryAssets.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                  {category === 'glasses' && '👓'} 
                  {category === 'hats' && '👒'} 
                  {category === 'clothing' && '👕'} 
                  {category === 'pets' && '🐾'} 
                  {category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                          isAccessoryEquipped(asset.id)
                            ? 'border-purple-200/30 bg-gradient-to-br from-purple-50/20 to-pink-50/20 shadow-sm scale-105'
                            : 'border-white/20 bg-white/15 hover:border-purple-100/30 hover:shadow-sm hover:scale-102 group-hover:shadow-sm'
                        }`}
                      >
                        <div className="w-24 h-24 mx-auto mb-2 relative">
                          <img 
                            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                            alt={asset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-base font-bold text-gray-800">{asset.name}</div>
                        <Badge className={`mt-1 ${getRarityColor(asset.rarity)}`}>
                          {asset.rarity}
                        </Badge>
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
      <TabsContent value="positioning" className="p-8 space-y-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
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
          <div className="text-center py-12 bg-gradient-to-br from-purple-50/30 to-pink-50/30 rounded-2xl backdrop-blur-sm border border-white/20">
            <p className="text-gray-700 mb-4 font-medium">Select an equipped accessory from the Accessories tab to position it</p>
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
      <TabsContent value="shop" className="p-8 space-y-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Asset Shop</h3>
          
          {/* Locked Assets */}
          {['base', 'accessory'].map((type) => {
            const lockedAssets = allAssets.filter(asset => 
              asset.type === type && !isUnlocked(asset.id)
            );
            
            if (lockedAssets.length === 0) return null;

            return (
              <div key={type} className="space-y-3">
                <h4 className="text-lg font-bold text-gray-800 capitalize">{type}s</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lockedAssets.map((asset) => (
                    <div key={asset.id} className="relative">
                      <div className={`p-4 rounded-xl border-2 ${getRarityColor(asset.rarity)}`}>
                        <div className="w-24 h-24 mx-auto mb-2 relative">
                          <img 
                            src={asset.filepath.startsWith('data:') ? asset.filepath : `${asset.filepath}?v=${Date.now()}`}
                            alt={asset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-base font-bold text-gray-800">{asset.name}</div>
                        <Badge className={`mt-1 ${getRarityColor(asset.rarity)}`}>
                          {asset.rarity}
                        </Badge>
                        <div className="mt-2 text-center">
                          <Button
                            onClick={() => purchaseAsset(asset)}
                            disabled={!canAfford(asset)}
                            size="sm"
                            className="w-full"
                          >
                            {asset.price} {asset.currency}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      {/* Upload Tab */}
      <TabsContent value="upload" className="p-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
        <AssetUploader onAssetAdded={onAssetsRefresh} />
      </TabsContent>

      {/* Rewards Tab */}
      <TabsContent value="rewards" className="p-8 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
        <ProductivityRewards 
          onCoinsEarned={onCoinsEarned}
          onSpecialCurrencyEarned={onSpecialCurrencyEarned}
        />
      </TabsContent>
    </>
  );
}