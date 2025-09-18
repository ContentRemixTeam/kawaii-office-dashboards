import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sword, 
  Target, 
  Star, 
  BookOpen, 
  Shield, 
  Heart, 
  Coins,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface QuestWelcomeProps {
  onGetStarted: () => void;
  onShowInstructions: () => void;
}

export default function QuestWelcome({ onGetStarted, onShowInstructions }: QuestWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const welcomeSteps = [
    {
      title: "Welcome to Quest Mode!",
      subtitle: "Turn your productivity into an epic adventure",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">⚔️</div>
          <p className="text-lg text-blue-100 leading-relaxed">
            Transform your daily tasks into thrilling quests, level up your character, 
            and embark on an epic productivity journey!
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-black/20 rounded-lg border border-purple-500/30">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Real Tasks</p>
              <p className="text-xs text-gray-300">Your actual work</p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg border border-blue-500/30">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Epic Quests</p>
              <p className="text-xs text-gray-300">Adventure rewards</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How Quest Mode Works",
      subtitle: "Your productivity journey in 5 simple steps",
      content: (
        <div className="space-y-4">
          {[
            { icon: <Crown className="w-5 h-5 text-purple-400" />, text: "Choose your character class and customize your hero" },
            { icon: <BookOpen className="w-5 h-5 text-blue-400" />, text: "Your real tasks automatically become epic quests" },
            { icon: <Star className="w-5 h-5 text-yellow-400" />, text: "Complete tasks to earn XP and level up your character" },
            { icon: <Sword className="w-5 h-5 text-red-400" />, text: "Unlock new abilities, equipment, and story chapters" },
            { icon: <Target className="w-5 h-5 text-green-400" />, text: "Track your progress through an epic productivity journey" }
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                {step.icon}
              </div>
              <p className="text-white text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Choose Your Path",
      subtitle: "Each class offers unique abilities and quest styles",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Scholar", emoji: "📚", focus: "Knowledge & Focus", bonus: "Extra XP from learning tasks" },
            { name: "Warrior", emoji: "⚔️", focus: "Strength & Action", bonus: "Bonus rewards for challenging tasks" },
            { name: "Merchant", emoji: "💰", focus: "Goals & Growth", bonus: "Double rewards for business tasks" },
            { name: "Healer", emoji: "💚", focus: "Balance & Wellness", bonus: "Health and self-care bonuses" }
          ].map((classInfo) => (
            <div key={classInfo.name} className="p-4 bg-black/30 rounded-lg border border-white/20">
              <div className="text-2xl mb-2">{classInfo.emoji}</div>
              <h4 className="text-white font-bold text-sm mb-1">{classInfo.name}</h4>
              <p className="text-blue-200 text-xs mb-2">{classInfo.focus}</p>
              <p className="text-gray-300 text-xs">{classInfo.bonus}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  const ScrollText = ({ className }: { className: string }) => <BookOpen className={className} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-black/40 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <CardTitle className="text-3xl font-bold text-white">
              {welcomeSteps[currentStep].title}
            </CardTitle>
          </div>
          <p className="text-blue-200 text-lg">{welcomeSteps[currentStep].subtitle}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {welcomeSteps[currentStep].content}
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-purple-400 w-8' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              variant="outline"
              className="bg-black/20 border-gray-500/30 text-white"
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={onShowInstructions}
                variant="outline"
                className="bg-black/20 border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Guide
              </Button>
              
              {currentStep < welcomeSteps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Your Adventure!
                </Button>
              )}
            </div>
          </div>
          
          {/* Quick Start Option */}
          <div className="text-center pt-4 border-t border-gray-600">
            <p className="text-gray-400 text-sm mb-2">Already familiar with Quest Mode?</p>
            <Button
              onClick={onGetStarted}
              variant="ghost"
              className="text-purple-300 hover:text-purple-200 hover:bg-purple-900/20"
            >
              Skip Tutorial & Start Adventure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}