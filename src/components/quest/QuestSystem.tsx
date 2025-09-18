import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScrollText,
  CheckCircle2,
  Clock,
  Star,
  Target,
  Zap,
  Calendar,
  Trophy,
  Coins,
  Sword,
  Shield,
  Heart,
  Timer,
  Map
} from 'lucide-react';
import { Quest } from './CharacterCreation';
import QuestMap from './QuestMap';

interface QuestSystemProps {
  character: any;
  onQuestComplete: (questId: string, expGained: number) => void;
}

// Generate daily quests based on productivity patterns
const generateDailyQuests = (): Quest[] => {
  const baseQuests = [
    {
      id: 'daily-tasks-3',
      title: 'Triple Threat',
      description: 'Complete 3 tasks to prove your dedication',
      type: 'daily' as const,
      difficulty: 'easy' as const,
      experienceReward: 150,
      goldReward: 25,
      requirements: { tasks: 3 },
      category: 'productivity' as const,
    },
    {
      id: 'focus-session-25',
      title: 'Deep Focus Mastery',
      description: 'Complete a 25-minute focused work session',
      type: 'daily' as const,
      difficulty: 'medium' as const,
      experienceReward: 200,
      goldReward: 30,
      requirements: { focusMinutes: 25 },
      category: 'focus' as const,
    },
    {
      id: 'morning-victory',
      title: 'Morning Victory',
      description: 'Complete your first task before 10 AM',
      type: 'daily' as const,
      difficulty: 'medium' as const,
      experienceReward: 175,
      goldReward: 35,
      requirements: { tasks: 1 },
      category: 'productivity' as const,
    },
    {
      id: 'big-three-challenge',
      title: 'The Big Three Challenge',
      description: 'Complete all three of your Big Three tasks',
      type: 'daily' as const,
      difficulty: 'hard' as const,
      experienceReward: 300,
      goldReward: 50,
      requirements: { tasks: 3 },
      category: 'productivity' as const,
    },
    {
      id: 'balance-keeper',
      title: 'Balance Keeper',
      description: 'Take breaks between work sessions',
      type: 'daily' as const,
      difficulty: 'easy' as const,
      experienceReward: 100,
      goldReward: 20,
      requirements: { tasks: 1 },
      category: 'balance' as const,
    }
  ];

  return baseQuests.map(quest => ({
    ...quest,
    progress: { current: 0, required: Object.values(quest.requirements)[0] },
    isCompleted: false,
    isActive: true,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  }));
};

// Generate weekly quests
const generateWeeklyQuests = (): Quest[] => {
  return [
    {
      id: 'weekly-consistency',
      title: 'Consistency Champion',
      description: 'Complete at least one task every day for 7 days',
      type: 'weekly' as const,
      difficulty: 'medium' as const,
      experienceReward: 500,
      goldReward: 100,
      requirements: { days: 7 },
      progress: { current: 0, required: 7 },
      isCompleted: false,
      isActive: true,
      category: 'growth' as const,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'focus-marathon',
      title: 'Focus Marathon',
      description: 'Accumulate 10 hours of focused work this week',
      type: 'weekly' as const,
      difficulty: 'hard' as const,
      experienceReward: 750,
      goldReward: 150,
      requirements: { focusMinutes: 600 },
      progress: { current: 0, required: 600 },
      isCompleted: false,
      isActive: true,
      category: 'focus' as const,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];
};

// Epic quests - long-term goals
const generateEpicQuests = (): Quest[] => {
  return [
    {
      id: 'epic-centurion',
      title: 'The Centurion',
      description: 'Complete 100 tasks to become a legendary productivity master',
      type: 'epic' as const,
      difficulty: 'legendary' as const,
      experienceReward: 2000,
      goldReward: 500,
      requirements: { tasks: 100 },
      progress: { current: 0, required: 100 },
      isCompleted: false,
      isActive: true,
      category: 'growth' as const,
    },
    {
      id: 'epic-focus-master',
      title: 'Master of Focus',
      description: 'Accumulate 100 hours of deep focus work',
      type: 'epic' as const,
      difficulty: 'legendary' as const,
      experienceReward: 2500,
      goldReward: 750,
      requirements: { focusMinutes: 6000 },
      progress: { current: 0, required: 6000 },
      isCompleted: false,
      isActive: true,
      category: 'focus' as const,
    }
  ];
};

export default function QuestSystem({ character, onQuestComplete }: QuestSystemProps) {
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'map' | 'active' | 'completed'>('map');
  const [selectedRegion, setSelectedRegion] = useState<string>('starting-village');

  useEffect(() => {
    // Load or generate quests - completely separate from arcade system
    const savedQuests = localStorage.getItem('quest_active_quests');
    const savedCompleted = localStorage.getItem('quest_completed_quests');
    
    if (savedQuests) {
      setActiveQuests(JSON.parse(savedQuests));
    } else {
      // Generate initial quest set - independent RPG progression
      const dailyQuests = generateDailyQuests();
      const weeklyQuests = generateWeeklyQuests();
      const epicQuests = generateEpicQuests();
      const allQuests = [...dailyQuests, ...weeklyQuests, ...epicQuests];
      setActiveQuests(allQuests);
      localStorage.setItem('quest_active_quests', JSON.stringify(allQuests));
    }

    if (savedCompleted) {
      setCompletedQuests(JSON.parse(savedCompleted));
    }
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'hard': return 'bg-red-600/20 text-red-300 border-red-500/30';
      case 'legendary': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'weekly': return <Target className="w-4 h-4 text-green-400" />;
      case 'epic': return <Crown className="w-4 h-4 text-purple-400" />;
      default: return <ScrollText className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Sword className="w-4 h-4" />;
      case 'focus': return <Zap className="w-4 h-4" />;
      case 'balance': return <Shield className="w-4 h-4" />;
      case 'growth': return <Star className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const simulateQuestProgress = (questId: string) => {
    setActiveQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && !quest.isCompleted) {
          const newProgress = Math.min(quest.progress.current + 1, quest.progress.required);
          const isNowCompleted = newProgress >= quest.progress.required;
          
          if (isNowCompleted) {
            onQuestComplete(questId, quest.experienceReward);
            
            // Move to completed quests
            setTimeout(() => {
              setCompletedQuests(prev => [...prev, { ...quest, isCompleted: true, progress: { ...quest.progress, current: newProgress } }]);
              setActiveQuests(prev => prev.filter(q => q.id !== questId));
            }, 1000);
          }
          
          return {
            ...quest,
            progress: { ...quest.progress, current: newProgress },
            isCompleted: isNowCompleted
          };
        }
        return quest;
      });
      
      localStorage.setItem('quest_active_quests', JSON.stringify(updated));
      return updated;
    });
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const Crown = ({ className }: { className: string }) => <Crown className={className} />;

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedTab('active'); // Switch to quests when region selected
  };

  return (
    <div className="space-y-6">
      {/* Adventure Map Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 text-2xl">
            <Map className="w-6 h-6 text-purple-400" />
            Adventure Map
            <Badge className="bg-purple-600/30 text-purple-200">
              Your Epic Journey
            </Badge>
          </CardTitle>
          <p className="text-blue-200">Explore the world and discover new challenges as you level up!</p>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
        <TabsList className="grid w-full grid-cols-3 bg-black/20">
          <TabsTrigger value="map" className="text-white data-[state=active]:bg-purple-600">
            <Map className="w-4 h-4 mr-2" />
            Adventure Map
          </TabsTrigger>
          <TabsTrigger value="active" className="text-white data-[state=active]:bg-purple-600">
            <ScrollText className="w-4 h-4 mr-2" />
            Active Quests ({activeQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-white data-[state=active]:bg-green-600">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed ({completedQuests.length})
          </TabsTrigger>
        </TabsList>

        {/* Adventure Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <QuestMap 
            character={character}
            onRegionSelect={handleRegionSelect}
            selectedRegion={selectedRegion}
          />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{character.level}</div>
                <div className="text-white text-sm">Current Level</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{activeQuests.length}</div>
                <div className="text-white text-sm">Active Quests</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{completedQuests.length}</div>
                <div className="text-white text-sm">Completed Quests</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Quests Tab */}
        <TabsContent value="active" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(selectedTab === 'active' ? activeQuests : completedQuests).map((quest) => (
          <Card key={quest.id} className={`bg-black/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
            quest.isCompleted 
              ? 'border-green-500/50 bg-green-900/10' 
              : 'border-purple-500/30 hover:border-purple-400/50'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(quest.type)}
                  <div>
                    <CardTitle className="text-white text-lg">{quest.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(quest.difficulty)}>
                        {quest.difficulty}
                      </Badge>
                      <Badge className="bg-gray-700/50 text-gray-300">
                        {getCategoryIcon(quest.category)}
                        <span className="ml-1 capitalize">{quest.category}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                {quest.isCompleted && <CheckCircle2 className="w-6 h-6 text-green-400" />}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{quest.description}</p>
              
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-white mb-2">
                  <span>Progress</span>
                  <span>{quest.progress.current}/{quest.progress.required}</span>
                </div>
                <Progress 
                  value={(quest.progress.current / quest.progress.required) * 100} 
                  className="h-3 bg-gray-700"
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}
                    style={{ width: `${(quest.progress.current / quest.progress.required) * 100}%` }}
                  />
                </Progress>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-blue-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{quest.experienceReward} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm">{quest.goldReward} Gold</span>
                  </div>
                </div>
                
                {quest.deadline && !quest.isCompleted && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{formatTimeRemaining(quest.deadline)}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!quest.isCompleted && selectedTab === 'active' && (
                <Button
                  onClick={() => simulateQuestProgress(quest.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={quest.progress.current >= quest.progress.required}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {quest.progress.current >= quest.progress.required ? 'Complete!' : 'Make Progress'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>

    {/* Completed Quests Tab */}
    <TabsContent value="completed" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {completedQuests.map((quest) => (
          <Card key={quest.id} className="bg-black/20 backdrop-blur-sm border-green-500/50 bg-green-900/10">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(quest.type)}
                  <div>
                    <CardTitle className="text-white text-lg">{quest.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(quest.difficulty)}>
                        {quest.difficulty}
                      </Badge>
                      <Badge className="bg-gray-700/50 text-gray-300">
                        {getCategoryIcon(quest.category)}
                        <span className="ml-1 capitalize">{quest.category}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{quest.description}</p>
              
              {/* Completed Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-white mb-2">
                  <span>Progress</span>
                  <span>Complete!</span>
                </div>
                <Progress value={100} className="h-3 bg-gray-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 w-full" />
                </Progress>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-blue-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{quest.experienceReward} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm">{quest.goldReward} Gold</span>
                  </div>
                </div>
                
                <Badge className="bg-green-600/20 text-green-200">
                  <Trophy className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  </Tabs>

      {/* Empty States */}
      {selectedTab === 'active' && activeQuests.length === 0 && (
        <div className="text-center py-12">
          <ScrollText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Quests</h3>
          <p className="text-gray-400">New quests will appear here as you progress!</p>
        </div>
      )}

      {selectedTab === 'completed' && completedQuests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Completed Quests</h3>
          <p className="text-gray-400">Complete some quests to see them here!</p>
        </div>
      )}
    </div>
  );
}