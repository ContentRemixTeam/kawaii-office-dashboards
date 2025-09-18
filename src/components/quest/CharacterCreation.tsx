import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sword, 
  Shield, 
  Wand2, 
  Heart, 
  Zap, 
  Target,
  ArrowLeft,
  Star,
  Crown,
  Sparkles,
  ScrollText,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Character Classes
export const CHARACTER_CLASSES = {
  warrior: {
    name: 'Productivity Warrior',
    icon: Sword,
    emoji: '⚔️',
    description: 'Masters of task completion and deadline conquering',
    baseStats: { strength: 15, intelligence: 8, agility: 12, wisdom: 10 },
    growthRates: { strength: 2.5, intelligence: 1.2, agility: 1.8, wisdom: 1.5 }
  },
  mage: {
    name: 'Focus Mage',
    icon: Wand2,
    emoji: '🔮',
    description: 'Specialists in deep work and concentration magic',
    baseStats: { strength: 8, intelligence: 15, agility: 10, wisdom: 12 },
    growthRates: { strength: 1.2, intelligence: 2.5, agility: 1.5, wisdom: 1.8 }
  },
  rogue: {
    name: 'Efficiency Rogue',
    icon: Target,
    emoji: '🎯',
    description: 'Quick and clever, finding the fastest path to goals',
    baseStats: { strength: 10, intelligence: 12, agility: 15, wisdom: 8 },
    growthRates: { strength: 1.5, intelligence: 1.8, agility: 2.5, wisdom: 1.2 }
  },
  paladin: {
    name: 'Balance Paladin',
    icon: Shield,
    emoji: '🛡️',
    description: 'Guardians of work-life balance and sustainable habits',
    baseStats: { strength: 12, intelligence: 10, agility: 8, wisdom: 15 },
    growthRates: { strength: 1.8, intelligence: 1.5, agility: 1.2, wisdom: 2.5 }
  }
};

// Experience and leveling
export const calculateLevel = (experience: number): number => {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

export const experienceToNextLevel = (experience: number): number => {
  const currentLevel = calculateLevel(experience);
  const nextLevelExp = Math.pow(currentLevel, 2) * 100;
  return nextLevelExp - experience;
};

export const experienceForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

// Character data interface
export interface Character {
  id: string;
  name: string;
  class: keyof typeof CHARACTER_CLASSES;
  level: number;
  experience: number;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
    wisdom: number;
  };
  avatar: {
    color: string;
    accessory: string;
  };
  achievements: string[];
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  joinDate: string;
}

// Quest interface
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'epic';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  experienceReward: number;
  goldReward: number;
  requirements: Record<string, number>;
  progress: {
    current: number;
    required: number;
  };
  isCompleted: boolean;
  isActive: boolean;
  category: 'productivity' | 'focus' | 'balance' | 'growth';
  deadline?: string;
}

const QUEST_CHARACTER_KEY = 'quest_character_v1';

interface CharacterCreationProps {
  onCharacterCreated: (character: Character) => void;
}

export function CharacterCreation({ onCharacterCreated }: CharacterCreationProps) {
  const [selectedClass, setSelectedClass] = useState<keyof typeof CHARACTER_CLASSES>('warrior');
  const [characterName, setCharacterName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedAccessory, setSelectedAccessory] = useState<string>('none');

  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const accessories = ['none', 'crown', 'glasses', 'hat', 'bandana'];

  const handleCreateCharacter = () => {
    if (!characterName.trim()) return;

    const classData = CHARACTER_CLASSES[selectedClass];
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: characterName.trim(),
      class: selectedClass,
      level: 1,
      experience: 0,
      stats: { ...classData.baseStats },
      avatar: {
        color: selectedColor,
        accessory: selectedAccessory
      },
      achievements: [],
      totalTasksCompleted: 0,
      totalFocusMinutes: 0,
      joinDate: new Date().toISOString()
    };

    localStorage.setItem(QUEST_CHARACTER_KEY, JSON.stringify(newCharacter));
    onCharacterCreated(newCharacter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            Create Your Hero
          </h1>
          <p className="text-blue-200 text-lg">Choose your path and begin your epic productivity adventure!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Preview */}
          <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Character Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div 
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl border-4 border-white/20 relative"
                  style={{ backgroundColor: selectedColor }}
                >
                  {CHARACTER_CLASSES[selectedClass].emoji}
                  {selectedAccessory === 'crown' && <div className="absolute -top-3 text-2xl">👑</div>}
                  {selectedAccessory === 'glasses' && <div className="absolute text-2xl">👓</div>}
                  {selectedAccessory === 'hat' && <div className="absolute -top-3 text-2xl">🎩</div>}
                  {selectedAccessory === 'bandana' && <div className="absolute -top-2 text-lg">🎽</div>}
                </div>
              </div>
              
              <div className="space-y-2 text-white">
                <h3 className="text-xl font-bold">{characterName || 'Your Character'}</h3>
                <p className="text-blue-200">{CHARACTER_CLASSES[selectedClass].name}</p>
                <Badge className="bg-purple-600">{CHARACTER_CLASSES[selectedClass].description}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Character Customization */}
          <div className="space-y-6">
            {/* Name Input */}
            <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <label className="block text-white font-medium mb-2">Character Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your character name"
                  className="w-full p-3 rounded-lg bg-black/40 border border-purple-500/30 text-white placeholder-gray-400"
                  maxLength={20}
                />
              </CardContent>
            </Card>

            {/* Class Selection */}
            <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Choose Your Class
                  </h3>
                  <p className="text-blue-200 text-sm">Each class affects your quest types and rewards:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CHARACTER_CLASSES).map(([classKey, classData]) => (
                    <button
                      key={classKey}
                      onClick={() => setSelectedClass(classKey as keyof typeof CHARACTER_CLASSES)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedClass === classKey 
                          ? 'border-purple-400 bg-purple-600/30' 
                          : 'border-purple-500/30 bg-black/20 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{classData.emoji}</span>
                        <h4 className="text-white font-bold text-sm">{classData.name}</h4>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">{classData.description}</p>
                      <div className="space-y-1">
                        <p className="text-blue-200 text-xs font-medium">Specializes in:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(classData.growthRates)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 2)
                            .map(([stat]) => (
                              <Badge key={stat} className="bg-purple-600/20 text-purple-200 text-xs capitalize">
                                {stat}
                              </Badge>
                            ))
                          }
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customization Section */}
            <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Customize Your Hero
                  </h3>
                  <p className="text-blue-200 text-sm">Personalize your character's appearance:</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Avatar Color</label>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-3">Accessory</label>
                    <div className="grid grid-cols-5 gap-2">
                      {accessories.map((accessory) => (
                        <button
                          key={accessory}
                          onClick={() => setSelectedAccessory(accessory)}
                          className={`p-2 rounded border-2 transition-all ${
                            selectedAccessory === accessory 
                              ? 'border-purple-400 bg-purple-600/30' 
                              : 'border-purple-500/30 bg-black/20'
                          }`}
                        >
                          <div className="text-white text-xs">
                            {accessory === 'none' ? 'None' : 
                             accessory === 'crown' ? '👑' :
                             accessory === 'glasses' ? '👓' :
                             accessory === 'hat' ? '🎩' : '🎽'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <div className="text-center space-y-4">
              <Button 
                onClick={handleCreateCharacter}
                disabled={!characterName.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 text-lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Begin Your Adventure!
              </Button>
              <p className="text-gray-400 text-sm">
                Ready to transform your productivity into an epic quest?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CharacterCreation as default };