import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Crown, 
  Target, 
  Star, 
  Shield, 
  Heart, 
  Coins,
  Sword,
  Brain,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';

interface QuestInstructionsProps {
  onClose: () => void;
  onStartAdventure: () => void;
}

export default function QuestInstructions({ onClose, onStartAdventure }: QuestInstructionsProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-black/90 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-2xl font-bold text-white">Quest Mode Guide</CardTitle>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-black/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">Overview</TabsTrigger>
              <TabsTrigger value="classes" className="text-white data-[state=active]:bg-purple-600">Classes</TabsTrigger>
              <TabsTrigger value="quests" className="text-white data-[state=active]:bg-purple-600">Quests</TabsTrigger>
              <TabsTrigger value="faq" className="text-white data-[state=active]:bg-purple-600">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  How Quest Mode Works
                </h3>
                
                <div className="grid gap-4">
                  {[
                    {
                      step: "1",
                      title: "Create Your Character",
                      description: "Choose a class (Scholar, Warrior, Merchant, or Healer) and customize your avatar. Each class has unique bonuses and quest styles.",
                      icon: <Crown className="w-5 h-5 text-purple-400" />
                    },
                    {
                      step: "2", 
                      title: "Your Tasks Become Quests",
                      description: "Your real productivity tasks are automatically transformed into epic quests with fantasy themes and rewards.",
                      icon: <Target className="w-5 h-5 text-blue-400" />
                    },
                    {
                      step: "3",
                      title: "Complete Quests for XP",
                      description: "Finish tasks to earn experience points, level up your character, and unlock new abilities and story content.",
                      icon: <Star className="w-5 h-5 text-yellow-400" />
                    },
                    {
                      step: "4",
                      title: "Track Your Adventure",
                      description: "Monitor your character's growth, view completed quests, and see your productivity transformed into an epic journey.",
                      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Step {item.step}: {item.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="classes" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sword className="w-5 h-5 text-red-400" />
                  Character Classes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Scholar",
                      emoji: "📚",
                      color: "blue",
                      focus: "Knowledge & Learning",
                      strengths: ["Intelligence", "Wisdom"],
                      bonus: "Extra XP from research and learning tasks",
                      bestFor: "Students, researchers, content creators"
                    },
                    {
                      name: "Warrior", 
                      emoji: "⚔️",
                      color: "red",
                      focus: "Strength & Action",
                      strengths: ["Strength", "Agility"],
                      bonus: "Bonus rewards for challenging and action-oriented tasks",
                      bestFor: "Project managers, entrepreneurs, fitness enthusiasts"
                    },
                    {
                      name: "Merchant",
                      emoji: "💰", 
                      color: "yellow",
                      focus: "Goals & Growth",
                      strengths: ["Intelligence", "Agility"],
                      bonus: "Double rewards for business and financial tasks",
                      bestFor: "Business owners, sales professionals, investors"
                    },
                    {
                      name: "Healer",
                      emoji: "💚",
                      color: "green", 
                      focus: "Balance & Wellness",
                      strengths: ["Wisdom", "Strength"],
                      bonus: "Health and self-care task bonuses",
                      bestFor: "Healthcare workers, coaches, wellness focused individuals"
                    }
                  ].map((classInfo) => (
                    <Card key={classInfo.name} className="bg-black/30 border-white/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{classInfo.emoji}</div>
                          <div>
                            <CardTitle className="text-white text-lg">{classInfo.name}</CardTitle>
                            <p className="text-gray-300 text-sm">{classInfo.focus}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-white font-medium text-sm mb-1">Strengths:</p>
                          <div className="flex gap-1">
                            {classInfo.strengths.map((strength) => (
                              <Badge key={strength} className="bg-purple-600/20 text-purple-200 text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm mb-1">Class Bonus:</p>
                          <p className="text-gray-300 text-xs">{classInfo.bonus}</p>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm mb-1">Best For:</p>
                          <p className="text-gray-300 text-xs">{classInfo.bestFor}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quests" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Understanding Quests
                </h3>
                
                <div className="space-y-4">
                  <Card className="bg-black/30 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Quest Types & Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { type: "Daily Quests", color: "blue", xp: "100-300 XP", description: "Complete daily tasks to build consistency" },
                        { type: "Weekly Quests", color: "green", xp: "500-750 XP", description: "Longer challenges for bigger rewards" },
                        { type: "Epic Quests", color: "purple", xp: "2000+ XP", description: "Legendary achievements for major milestones" }
                      ].map((quest) => (
                        <div key={quest.type} className="flex justify-between items-center p-3 bg-black/20 rounded border border-white/10">
                          <div>
                            <p className="text-white font-medium text-sm">{quest.type}</p>
                            <p className="text-gray-300 text-xs">{quest.description}</p>
                          </div>
                          <Badge className="bg-yellow-600/20 text-yellow-200">
                            {quest.xp}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/30 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Experience & Leveling
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-white font-medium text-sm">XP Sources:</p>
                        <ul className="text-gray-300 text-xs space-y-1 ml-4">
                          <li>• Task completion: 100-300 XP per task</li>
                          <li>• Focus sessions: 50 XP per 25 minutes</li>
                          <li>• Daily streaks: Bonus multipliers</li>
                          <li>• Class-specific bonuses: Up to 2x XP</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-medium text-sm">Level Benefits:</p>
                        <ul className="text-gray-300 text-xs space-y-1 ml-4">
                          <li>• Increased character stats</li>
                          <li>• Unlocked abilities and equipment</li>
                          <li>• Access to harder quests with better rewards</li>
                          <li>• Story progression and achievements</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  Frequently Asked Questions
                </h3>
                
                <div className="space-y-3">
                  {[
                    {
                      q: "How do I get more quests?",
                      a: "Quests are automatically generated based on your productivity patterns. Complete current quests to unlock new ones, and new daily quests appear each day."
                    },
                    {
                      q: "What happens when I level up?",
                      a: "Leveling up increases your character stats, unlocks new abilities, provides access to harder quests with better rewards, and progresses your character's story."
                    },
                    {
                      q: "Can I change my character class?",
                      a: "Currently, you can reset your character to choose a new class, but this will lose your progress. We're working on a class change feature for the future."
                    },
                    {
                      q: "How does this connect to my regular tasks?",
                      a: "Quest Mode transforms your existing productivity workflow into a game. Your Big Three tasks, focus sessions, and daily goals all contribute to quest completion and character progression."
                    },
                    {
                      q: "Do I need to use Quest Mode to be productive?",
                      a: "No! Quest Mode is an optional gamification layer. You can still use all the regular productivity features without Quest Mode. It's just a fun way to add adventure to your workflow."
                    },
                    {
                      q: "What's the difference between Quest Mode and Pet Mode?",
                      a: "Pet Mode focuses on collecting and caring for virtual pets through task completion. Quest Mode transforms you into a character on an epic adventure. Both are different ways to gamify your productivity!"
                    }
                  ].map((faq, index) => (
                    <Card key={index} className="bg-black/20 border-white/10">
                      <CardContent className="p-4">
                        <h4 className="text-white font-medium text-sm mb-2">{faq.q}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center pt-6 border-t border-gray-600">
            <Button
              onClick={onClose}
              variant="outline" 
              className="bg-black/20 border-gray-500/30 text-white"
            >
              Close Guide
            </Button>
            
            <Button
              onClick={onStartAdventure}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Start Your Adventure!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}