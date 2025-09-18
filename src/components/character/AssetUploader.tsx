import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { addUploadedAsset, getRarityColor } from '@/lib/assetManager';
import { CharacterAsset } from '@/types/character';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface AssetUploaderProps {
  onAssetAdded: (asset: CharacterAsset) => void;
}

export default function AssetUploader({ onAssetAdded }: AssetUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedShopIcon, setSelectedShopIcon] = useState<File | null>(null);
  const [shopIconPreview, setShopIconPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Form data
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState<CharacterAsset['category']>('glasses');
  const [price, setPrice] = useState(50);
  const [currency, setCurrency] = useState<CharacterAsset['currency']>('coins');
  const [rarity, setRarity] = useState<CharacterAsset['rarity']>('common');
  const [description, setDescription] = useState('');
  const [unlockCondition, setUnlockCondition] = useState('');

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Auto-generate name from filename
    if (!assetName) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAssetName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleShopIconSelect = (file: File) => {
    setSelectedShopIcon(file);
    const url = URL.createObjectURL(file);
    setShopIconPreview(url);
  };

  const removeBackgroundFromImage = async () => {
    if (!selectedFile) return;
    
    setIsRemoving(true);
    try {
      const image = await loadImage(selectedFile);
      const processedBlob = await removeBackground(image);
      
      // Create new file from processed blob
      const processedFile = new File([processedBlob], selectedFile.name, { type: 'image/png' });
      setSelectedFile(processedFile);
      
      // Update preview
      const newUrl = URL.createObjectURL(processedBlob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newUrl);
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !assetName.trim()) return;
    
    setIsProcessing(true);
    try {
      const asset = await addUploadedAsset(
        selectedFile,
        assetName,
        category,
        price,
        currency,
        rarity
      );
      
      onAssetAdded(asset);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedShopIcon(null);
      setShopIconPreview('');
      setAssetName('');
      setDescription('');
      setUnlockCondition('');
      setPrice(50);
      setCategory('glasses');
      setCurrency('coins');
      setRarity('common');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const clearShopIcon = () => {
    if (shopIconPreview) URL.revokeObjectURL(shopIconPreview);
    setSelectedShopIcon(null);
    setShopIconPreview('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Store Management - Add New Accessory
        </CardTitle>
        <p className="text-sm text-muted-foreground">Upload accessories and configure store details</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-48 max-h-48 object-contain rounded-lg"
                />
                <Button
                  onClick={clearFile}
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={removeBackgroundFromImage}
                  variant="outline"
                  disabled={isRemoving}
                >
                  {isRemoving ? 'Removing...' : 'Remove Background'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop an image here</p>
                <p className="text-muted-foreground">or click to browse</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Asset Configuration */}
        {selectedFile && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name *</Label>
                  <Input
                    id="asset-name"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Enter asset name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as CharacterAsset['category'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glasses">Glasses</SelectItem>
                      <SelectItem value="hats">Hats</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="pets">Pets</SelectItem>
                      <SelectItem value="backgrounds">Backgrounds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the accessory"
                  />
                </div>
              </div>
            </div>

            {/* Shop Icon Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop Display Icon</h3>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {selectedShopIcon ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={shopIconPreview} 
                        alt="Shop icon preview" 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <Button
                        onClick={clearShopIcon}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedShopIcon.name}</p>
                      <p className="text-xs text-muted-foreground">Shop display icon</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload shop icon (optional)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleShopIconSelect(file);
                      }}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Store Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Store Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={(value) => setCurrency(value as CharacterAsset['currency'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coins">Coins</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select value={rarity} onValueChange={(value) => setRarity(value as CharacterAsset['rarity'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="unlock-condition">Unlock Condition (optional)</Label>
                  <Input
                    id="unlock-condition"
                    value={unlockCondition}
                    onChange={(e) => setUnlockCondition(e.target.value)}
                    placeholder="e.g., Complete 10 tasks, Reach level 5"
                  />
                </div>

                <div className="flex items-end">
                  <Badge className={getRarityColor(rarity)}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <Button 
            onClick={handleUpload}
            disabled={!assetName.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Adding to Store...' : 'Add to Store Catalog'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}