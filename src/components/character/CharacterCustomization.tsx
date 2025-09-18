import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductivityRewards from './ProductivityRewards';

interface Character {
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

interface StoreItem {
  id: string;
  name: string;
  category: 'clothing' | 'homeDecor';
  subcategory: string;
  price: number;
  currency: 'coins' | 'special';
  rarity: 'common' | 'rare' | 'legendary';
  unlockCondition?: string;
  emoji: string;
}

const CHARACTER_TYPES = [
  { id: 'human', name: 'Human', emoji: '👧', description: 'Classic kawaii human character' },
  { id: 'cat', name: 'Cat Person', emoji: '🐱', description: 'Adorable cat-eared character' },
  { id: 'fairy', name: 'Fairy', emoji: '🧚', description: 'Magical fairy with wings' },
  { id: 'bear', name: 'Bear', emoji: '🐻', description: 'Cuddly bear character' }
];

const HAIR_STYLES = [
  { id: 'short', name: 'Short & Sweet', emoji: '✂️' },
  { id: 'long', name: 'Long & Flowing', emoji: '🌊' },
  { id: 'pigtails', name: 'Kawaii Pigtails', emoji: '🎀' },
  { id: 'buns', name: 'Space Buns', emoji: '🍙' },
  { id: 'curly', name: 'Bouncy Curls', emoji: '🌀' }
];

const EXPRESSIONS = [
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'excited', name: 'Excited', emoji: '🤗' },
  { id: 'focused', name: 'Focused', emoji: '😤' },
  { id: 'sleepy', name: 'Sleepy', emoji: '😴' },
  { id: 'determined', name: 'Determined', emoji: '💪' }
];

const STORE_ITEMS: StoreItem[] = [
  // Clothing - Tops
  { id: 'cozy-sweater', name: 'Cozy Sweater', category: 'clothing', subcategory: 'tops', price: 50, currency: 'coins', rarity: 'common', emoji: '🧥' },
  { id: 'study-hoodie', name: 'Study Hoodie', category: 'clothing', subcategory: 'tops', price: 75, currency: 'coins', rarity: 'common', emoji: '👘' },
  { id: 'kawaii-tshirt', name: 'Kawaii T-Shirt', category: 'clothing', subcategory: 'tops', price: 40, currency: 'coins', rarity: 'common', emoji: '👕' },
  { id: 'magic-robe', name: 'Magic Robe', category: 'clothing', subcategory: 'tops', price: 5, currency: 'special', rarity: 'legendary', emoji: '🔮' },
  
  // Clothing - Bottoms
  { id: 'comfy-pants', name: 'Comfy Pants', category: 'clothing', subcategory: 'bottoms', price: 45, currency: 'coins', rarity: 'common', emoji: '👖' },
  { id: 'cute-skirt', name: 'Cute Skirt', category: 'clothing', subcategory: 'bottoms', price: 55, currency: 'coins', rarity: 'common', emoji: '👗' },
  { id: 'productivity-shorts', name: 'Productivity Shorts', category: 'clothing', subcategory: 'bottoms', price: 35, currency: 'coins', rarity: 'common', emoji: '🩳' },
  
  // Clothing - Accessories
  { id: 'focus-glasses', name: 'Focus Glasses', category: 'clothing', subcategory: 'accessories', price: 60, currency: 'coins', rarity: 'rare', emoji: '👓' },
  { id: 'task-crown', name: 'Task Crown', category: 'clothing', subcategory: 'accessories', price: 3, currency: 'special', rarity: 'legendary', emoji: '👑' },
  { id: 'motivation-bow', name: 'Motivation Bow', category: 'clothing', subcategory: 'accessories', price: 30, currency: 'coins', rarity: 'common', emoji: '🎀' },
  
  // Home Decor - Furniture
  { id: 'study-desk', name: 'Study Desk', category: 'homeDecor', subcategory: 'furniture', price: 120, currency: 'coins', rarity: 'common', emoji: '🪑' },
  { id: 'cozy-chair', name: 'Cozy Chair', category: 'homeDecor', subcategory: 'furniture', price: 80, currency: 'coins', rarity: 'common', emoji: '🛋️' },
  { id: 'bookshelf', name: 'Bookshelf', category: 'homeDecor', subcategory: 'furniture', price: 100, currency: 'coins', rarity: 'rare', emoji: '📚' },
  
  // Home Decor - Decorations
  { id: 'plant-pot', name: 'Plant Pot', category: 'homeDecor', subcategory: 'decorations', price: 25, currency: 'coins', rarity: 'common', emoji: '🪴' },
  { id: 'fairy-lights', name: 'Fairy Lights', category: 'homeDecor', subcategory: 'decorations', price: 40, currency: 'coins', rarity: 'common', emoji: '✨' },
  { id: 'achievement-poster', name: 'Achievement Poster', category: 'homeDecor', subcategory: 'decorations', price: 2, currency: 'special', rarity: 'rare', emoji: '🏆' },
  
  // Backgrounds
  { id: 'garden-view', name: 'Garden View', category: 'homeDecor', subcategory: 'backgrounds', price: 150, currency: 'coins', rarity: 'rare', emoji: '🌺' },
  { id: 'city-sunset', name: 'City Sunset', category: 'homeDecor', subcategory: 'backgrounds', price: 4, currency: 'special', rarity: 'legendary', emoji: '🌅' },
  { id: 'cozy-library', name: 'Cozy Library', category: 'homeDecor', subcategory: 'backgrounds', price: 200, currency: 'coins', rarity: 'rare', emoji: '📖' }
];

const COLORS = {
  skin: ['#fdbcb4', '#eab308', '#8b5a3c', '#f1c40f', '#e91e63'],
  hair: ['#8b4513', '#ffd700', '#000000', '#ff69b4', '#9b59b6', '#f39c12'],
  eyes: ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c']
};

const DEFAULT_CHARACTER: Character = {
  id: crypto.randomUUID(),
  name: 'My Character',
  type: 'human',
  appearance: {
    skinColor: COLORS.skin[0],
    hairStyle: 'short',
    hairColor: COLORS.hair[0],
    eyeShape: 'round',
    eyeColor: COLORS.eyes[0],
    expression: 'happy',
    outfit: {
      top: 'kawaii-tshirt',
      bottom: 'comfy-pants',
      accessory: 'motivation-bow'
    }
  },
  room: {
    background: 'default',
    furniture: ['study-desk'],
    decorations: ['plant-pot']
  },
  coins: 150, // Starting coins
  specialCurrency: 1,
  unlockedItems: ['kawaii-tshirt', 'comfy-pants', 'motivation-bow', 'study-desk', 'plant-pot']
};

interface CharacterCustomizationProps {
  onBack: () => void;
}

export default function CharacterCustomization({ onBack }: CharacterCustomizationProps) {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [selectedTab, setSelectedTab] = useState<'appearance' | 'clothing' | 'room' | 'store' | 'rewards'>('appearance');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<'clothing' | 'homeDecor'>('clothing');

  // Load character from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kawaii_character_v1');
    if (saved) {
      try {
        setCharacter(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load character:', error);
      }
    }
  }, []);

  // Save character to localStorage
  const saveCharacter = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
    localStorage.setItem('kawaii_character_v1', JSON.stringify(updatedCharacter));
  };

  const canAfford = (item: StoreItem) => {
    if (item.currency === 'coins') {
      return character.coins >= item.price;
    }
    return character.specialCurrency >= item.price;
  };

  const isUnlocked = (itemId: string) => {
    return character.unlockedItems.includes(itemId);
  };

  const purchaseItem = (item: StoreItem) => {
    if (!canAfford(item) || isUnlocked(item.id)) return;

    const updatedCharacter = { ...character };
    
    if (item.currency === 'coins') {
      updatedCharacter.coins -= item.price;
    } else {
      updatedCharacter.specialCurrency -= item.price;
    }
    
    updatedCharacter.unlockedItems.push(item.id);
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

  const updateAppearance = (key: string, value: string) => {
    const updatedCharacter = {
      ...character,
      appearance: {
        ...character.appearance,
        [key]: value
      }
    };
    saveCharacter(updatedCharacter);
  };

  const updateOutfit = (piece: string, itemId: string) => {
    const updatedCharacter = {
      ...character,
      appearance: {
        ...character.appearance,
        outfit: {
          ...character.appearance.outfit,
          [piece]: itemId
        }
      }
    };
    saveCharacter(updatedCharacter);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600/20 text-gray-200 border-gray-500/30';
      case 'rare': return 'bg-blue-600/20 text-blue-200 border-blue-500/30';
      case 'legendary': return 'bg-purple-600/20 text-purple-200 border-purple-500/30';
      default: return 'bg-gray-600/20 text-gray-200 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="bg-white/80 border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-pink-700 flex items-center gap-3 font-cinzel">
                <Heart className="w-8 h-8 text-pink-500" />
                Character Mode
              </h1>
              <p className="text-pink-600 mt-2">
                Customize your kawaii character with productivity rewards!
              </p>
            </div>
          </div>
          
          {/* Currency Display */}
          <div className="flex gap-4">
            <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-400/30 text-lg px-4 py-2">
              <Coins className="w-4 h-4 mr-2" />
              {character.coins} Coins
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-700 border-purple-400/30 text-lg px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              {character.specialCurrency} Special
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-pink-700 font-cinzel flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {character.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Character Avatar Display */}
                <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border-2 border-pink-200">
                  <div className="text-center space-y-4">
                    {/* Character Base */}
                    <div 
                      className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl border-4 border-pink-300 shadow-lg"
                      style={{ backgroundColor: character.appearance.skinColor }}
                    >
                      {CHARACTER_TYPES.find(t => t.id === character.type)?.emoji}
                    </div>
                    
                    {/* Character Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-pink-700">{character.name}</h3>
                      <div className="flex justify-center gap-2 flex-wrap">
                        <Badge className="bg-pink-100 text-pink-700">
                          {CHARACTER_TYPES.find(t => t.id === character.type)?.name}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700">
                          {EXPRESSIONS.find(e => e.id === character.appearance.expression)?.name}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Current Outfit Display */}
                    <div className="grid grid-cols-3 gap-2 text-2xl">
                      <div title="Top">
                        {STORE_ITEMS.find(i => i.id === character.appearance.outfit.top)?.emoji}
                      </div>
                      <div title="Bottom">
                        {STORE_ITEMS.find(i => i.id === character.appearance.outfit.bottom)?.emoji}
                      </div>
                      <div title="Accessory">
                        {STORE_ITEMS.find(i => i.id === character.appearance.outfit.accessory)?.emoji}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Room Preview */}
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border-2 border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    My Room
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-xl">
                    {character.room.furniture.map((furnitureId, index) => (
                      <div key={index} title={STORE_ITEMS.find(i => i.id === furnitureId)?.name}>
                        {STORE_ITEMS.find(i => i.id === furnitureId)?.emoji}
                      </div>
                    ))}
                    {character.room.decorations.map((decorationId, index) => (
                      <div key={index} title={STORE_ITEMS.find(i => i.id === decorationId)?.name}>
                        {STORE_ITEMS.find(i => i.id === decorationId)?.emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Tabs */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardContent className="p-0">
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
                  <TabsList className="grid w-full grid-cols-5 bg-pink-50">
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-pink-200">
                      <Smile className="w-4 h-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger value="clothing" className="data-[state=active]:bg-pink-200">
                      <Shirt className="w-4 h-4 mr-2" />
                      Clothing
                    </TabsTrigger>
                    <TabsTrigger value="room" className="data-[state=active]:bg-pink-200">
                      <Home className="w-4 h-4 mr-2" />
                      Room
                    </TabsTrigger>
                    <TabsTrigger value="store" className="data-[state=active]:bg-pink-200">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Store
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="data-[state=active]:bg-pink-200">
                      <Gift className="w-4 h-4 mr-2" />
                      Rewards
                    </TabsTrigger>
                  </TabsList>

                  {/* Appearance Tab */}
                  <TabsContent value="appearance" className="p-6 space-y-6">
                    {/* Character Type */}
                    <div>
                      <h3 className="text-lg font-semibold text-pink-700 mb-3">Character Type</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CHARACTER_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => updateAppearance('type', type.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              character.type === type.id
                                ? 'border-pink-400 bg-pink-100'
                                : 'border-pink-200 bg-white hover:border-pink-300'
                            }`}
                          >
                            <div className="text-3xl mb-2">{type.emoji}</div>
                            <div className="text-sm font-medium text-pink-700">{type.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hair Style */}
                    <div>
                      <h3 className="text-lg font-semibold text-pink-700 mb-3">Hair Style</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {HAIR_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => updateAppearance('hairStyle', style.id)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              character.appearance.hairStyle === style.id
                                ? 'border-pink-400 bg-pink-100'
                                : 'border-pink-200 bg-white hover:border-pink-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{style.emoji}</div>
                            <div className="text-xs font-medium text-pink-700">{style.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Skin Color */}
                      <div>
                        <h4 className="text-md font-semibold text-pink-700 mb-2">Skin Color</h4>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.skin.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateAppearance('skinColor', color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                character.appearance.skinColor === color
                                  ? 'border-pink-400 scale-110'
                                  : 'border-pink-200 hover:border-pink-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Hair Color */}
                      <div>
                        <h4 className="text-md font-semibold text-pink-700 mb-2">Hair Color</h4>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.hair.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateAppearance('hairColor', color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                character.appearance.hairColor === color
                                  ? 'border-pink-400 scale-110'
                                  : 'border-pink-200 hover:border-pink-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Eye Color */}
                      <div>
                        <h4 className="text-md font-semibold text-pink-700 mb-2">Eye Color</h4>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.eyes.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateAppearance('eyeColor', color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                character.appearance.eyeColor === color
                                  ? 'border-pink-400 scale-110'
                                  : 'border-pink-200 hover:border-pink-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expression */}
                    <div>
                      <h3 className="text-lg font-semibold text-pink-700 mb-3">Expression</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {EXPRESSIONS.map((expr) => (
                          <button
                            key={expr.id}
                            onClick={() => updateAppearance('expression', expr.id)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              character.appearance.expression === expr.id
                                ? 'border-pink-400 bg-pink-100'
                                : 'border-pink-200 bg-white hover:border-pink-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{expr.emoji}</div>
                            <div className="text-xs font-medium text-pink-700">{expr.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Clothing Tab */}
                  <TabsContent value="clothing" className="p-6 space-y-6">
                    {['tops', 'bottoms', 'accessories'].map((category) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-pink-700 mb-3 capitalize">{category}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {STORE_ITEMS
                            .filter(item => item.subcategory === category && isUnlocked(item.id))
                            .map((item) => (
                              <button
                                key={item.id}
                                onClick={() => updateOutfit(category.slice(0, -1), item.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  character.appearance.outfit[category.slice(0, -1) as keyof typeof character.appearance.outfit] === item.id
                                    ? 'border-pink-400 bg-pink-100'
                                    : 'border-pink-200 bg-white hover:border-pink-300'
                                }`}
                              >
                                <div className="text-3xl mb-2">{item.emoji}</div>
                                <div className="text-sm font-medium text-pink-700">{item.name}</div>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Room Tab */}
                  <TabsContent value="room" className="p-6">
                    <div className="text-center py-12">
                      <Home className="w-16 h-16 mx-auto text-pink-400 mb-4" />
                      <h3 className="text-xl font-semibold text-pink-700 mb-2">Room Customization</h3>
                      <p className="text-pink-600">Coming soon! Drag and drop furniture to decorate your space.</p>
                    </div>
                  </TabsContent>

                  {/* Store Tab */}
                  <TabsContent value="store" className="p-6">
                    {/* Store Category Tabs */}
                    <div className="flex gap-2 mb-6">
                      <Button
                        onClick={() => setSelectedStoreCategory('clothing')}
                        variant={selectedStoreCategory === 'clothing' ? 'default' : 'outline'}
                        className={selectedStoreCategory === 'clothing' ? 'bg-pink-500' : ''}
                      >
                        <Shirt className="w-4 h-4 mr-2" />
                        Clothing
                      </Button>
                      <Button
                        onClick={() => setSelectedStoreCategory('homeDecor')}
                        variant={selectedStoreCategory === 'homeDecor' ? 'default' : 'outline'}
                        className={selectedStoreCategory === 'homeDecor' ? 'bg-pink-500' : ''}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Home Decor
                      </Button>
                    </div>

                    {/* Store Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {STORE_ITEMS
                        .filter(item => item.category === selectedStoreCategory)
                        .map((item) => (
                          <Card key={item.id} className="bg-white border-pink-200">
                            <CardContent className="p-4">
                              <div className="text-center space-y-3">
                                <div className="text-4xl">{item.emoji}</div>
                                <div>
                                  <h4 className="font-semibold text-pink-700">{item.name}</h4>
                                  <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                                </div>
                                <div className="flex items-center justify-center gap-1 text-sm">
                                  {item.currency === 'coins' ? (
                                    <Coins className="w-4 h-4 text-yellow-600" />
                                  ) : (
                                    <Star className="w-4 h-4 text-purple-600" />
                                  )}
                                  <span className="font-medium">{item.price}</span>
                                </div>
                                <Button
                                  onClick={() => purchaseItem(item)}
                                  disabled={!canAfford(item) || isUnlocked(item.id)}
                                  className={`w-full ${
                                    isUnlocked(item.id) 
                                      ? 'bg-green-500 hover:bg-green-500' 
                                      : !canAfford(item) 
                                        ? 'bg-gray-400 hover:bg-gray-400' 
                                        : 'bg-pink-500 hover:bg-pink-600'
                                  }`}
                                >
                                  {isUnlocked(item.id) ? 'Owned' : canAfford(item) ? 'Buy' : 'Can\'t Afford'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Rewards Tab */}
                  <TabsContent value="rewards" className="p-6">
                    <ProductivityRewards
                      onCoinsEarned={handleCoinsEarned}
                      onSpecialCurrencyEarned={handleSpecialCurrencyEarned}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}