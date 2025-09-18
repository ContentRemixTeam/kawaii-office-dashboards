import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Sword, 
  Wand2, 
  Target, 
  Shield,
  Star,
  Crown,
  Heart,
  Zap,
  Brain,
  Clock
} from 'lucide-react';
import { Character, CHARACTER_CLASSES, calculateLevel, experienceToNextLevel } from './CharacterCreation';

interface CharacterDisplayProps {
  character: Character;
  onLevelUp?: () => void;
}

export default function CharacterDisplay({ character, onLevelUp }: CharacterDisplayProps) {
  const classData = CHARACTER_CLASSES[character.class];
  const currentLevel = calculateLevel(character.experience);
  const expToNext = experienceToNextLevel(character.experience);
  const expForCurrentLevel = character.level > 1 ? Math.pow(character.level - 1, 2) * 100 : 0;
  const expForNextLevel = Math.pow(character.level, 2) * 100;
  const levelProgress = ((character.experience - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100;

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'strength': return <Sword className="w-4 h-4 text-red-500" />;
      case 'intelligence': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'agility': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'wisdom': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Character Avatar & Info */}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="relative mx-auto mb-4">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 border-purple-400/50 relative"
              style={{ backgroundColor: character.avatar.color }}
            >
              {classData.emoji}
              {character.avatar.accessory === 'crown' && <div className="absolute -top-3 text-2xl">👑</div>}
              {character.avatar.accessory === 'glasses' && <div className="absolute text-2xl">👓</div>}
              {character.avatar.accessory === 'hat' && <div className="absolute -top-3 text-2xl">🎩</div>}
              {character.avatar.accessory === 'bandana' && <div className="absolute -top-2 text-lg">🎽</div>}
            </div>
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-orange-600">
              Level {character.level}
            </Badge>
          </div>
          <CardTitle className="text-white text-xl font-bold">{character.name}</CardTitle>
          <p className="text-blue-100 font-medium">{classData.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Experience Bar */}
          <div>
            <div className="flex justify-between text-sm text-white font-medium mb-2">
              <span>Experience</span>
              <span>{character.experience.toLocaleString()} XP</span>
            </div>
            <Progress value={levelProgress} className="h-3 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" 
                   style={{ width: `${levelProgress}%` }} />
            </Progress>
            <div className="text-xs text-blue-100 mt-1 text-center font-medium">
              {expToNext.toLocaleString()} XP to next level
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 rounded bg-black/40 border border-white/10">
              <div className="text-2xl font-bold text-green-300">{character.totalTasksCompleted}</div>
              <div className="text-xs text-white font-medium">Tasks Completed</div>
            </div>
            <div className="text-center p-2 rounded bg-black/40 border border-white/10">
              <div className="text-2xl font-bold text-blue-300">{Math.floor(character.totalFocusMinutes / 60)}h</div>
              <div className="text-xs text-white font-medium">Focus Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Stats */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-bold flex items-center gap-2">
            <Sword className="w-5 h-5 text-blue-400" />
            Character Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(character.stats).map(([statName, statValue]) => {
            const growthRate = classData.growthRates[statName as keyof typeof classData.growthRates];
            const maxForLevel = Math.floor(classData.baseStats[statName as keyof typeof classData.baseStats] + (character.level - 1) * growthRate);
            
            return (
              <div key={statName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatIcon(statName)}
                    <span className="text-white font-medium capitalize">{statName}</span>
                  </div>
                  <span className="text-white font-bold">{statValue}</span>
                </div>
                <Progress value={(statValue / maxForLevel) * 100} className="h-2 bg-gray-700">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(statValue / maxForLevel) * 100}%` }}
                  />
                </Progress>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-gray-600">
            <div className="text-sm text-blue-100">
              <strong className="text-white">Class Bonus:</strong> {classData.description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Progress */}
      <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-bold flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recent Achievements */}
          <div className="space-y-2">
            {character.achievements.length > 0 ? (
              character.achievements.slice(-3).map((achievement, index) => (
                <Badge key={index} className="w-full justify-start bg-yellow-600/20 text-yellow-200">
                  🏆 {achievement}
                </Badge>
              ))
            ) : (
              <div className="text-center text-white py-4">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Complete quests to earn achievements!</p>
              </div>
            )}
          </div>

          {/* Character Progression */}
          <div className="pt-4 border-t border-gray-600 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-200 font-medium">Member since</span>
              <span className="text-white font-bold">{new Date(character.joinDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-200 font-medium">Days active</span>
              <span className="text-white font-bold">
                {Math.floor((Date.now() - new Date(character.joinDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-200 font-medium">Average daily tasks</span>
              <span className="text-white font-bold">
                {character.totalTasksCompleted > 0 ? 
                  Math.round(character.totalTasksCompleted / Math.max(1, Math.floor((Date.now() - new Date(character.joinDate).getTime()) / (1000 * 60 * 60 * 24)))) : 
                  0
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}