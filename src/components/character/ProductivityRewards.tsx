import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Sparkles,
  Coins,
  Star,
  Gift,
  Calendar,
  Target,
  Trophy,
  Zap
} from 'lucide-react';

interface ProductivityRewards {
  dailyCoins: number;
  streakBonus: number;
  completedTasks: number;
  specialCurrencyEarned: number;
}

interface RewardSystemProps {
  onCoinsEarned: (amount: number) => void;
  onSpecialCurrencyEarned: (amount: number) => void;
}

const REWARD_RATES = {
  TASK_COMPLETION: 10,
  BIG_THREE_BONUS: 15,
  DAILY_STREAK: 5,
  WEEKLY_GOAL: 25,
  MILESTONE_SPECIAL: 1
};

export default function ProductivityRewards({ onCoinsEarned, onSpecialCurrencyEarned }: RewardSystemProps) {
  const [dailyStats, setDailyStats] = useState<ProductivityRewards>({
    dailyCoins: 0,
    streakBonus: 0,
    completedTasks: 0,
    specialCurrencyEarned: 0
  });
  
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [lastReward, setLastReward] = useState<{amount: number, type: 'coins' | 'special'} | null>(null);

  // Listen for task completions and award coins
  useEffect(() => {
    const handleTaskComplete = () => {
      const coinsEarned = REWARD_RATES.TASK_COMPLETION;
      setDailyStats(prev => ({
        ...prev,
        dailyCoins: prev.dailyCoins + coinsEarned,
        completedTasks: prev.completedTasks + 1
      }));
      
      onCoinsEarned(coinsEarned);
      showRewardAnimation(coinsEarned, 'coins');
    };

    const handleBigThreeComplete = () => {
      const bonusCoins = REWARD_RATES.BIG_THREE_BONUS;
      setDailyStats(prev => ({
        ...prev,
        dailyCoins: prev.dailyCoins + bonusCoins
      }));
      
      onCoinsEarned(bonusCoins);
      showRewardAnimation(bonusCoins, 'coins');
    };

    const handleMilestone = () => {
      const specialEarned = REWARD_RATES.MILESTONE_SPECIAL;
      setDailyStats(prev => ({
        ...prev,
        specialCurrencyEarned: prev.specialCurrencyEarned + specialEarned
      }));
      
      onSpecialCurrencyEarned(specialEarned);
      showRewardAnimation(specialEarned, 'special');
    };

    // Simulate productivity events for demo
    window.addEventListener('taskCompleted', handleTaskComplete);
    window.addEventListener('bigThreeCompleted', handleBigThreeComplete);
    window.addEventListener('milestoneReached', handleMilestone);

    return () => {
      window.removeEventListener('taskCompleted', handleTaskComplete);
      window.removeEventListener('bigThreeCompleted', handleBigThreeComplete);
      window.removeEventListener('milestoneReached', handleMilestone);
    };
  }, [onCoinsEarned, onSpecialCurrencyEarned]);

  const showRewardAnimation = (amount: number, type: 'coins' | 'special') => {
    setLastReward({ amount, type });
    setShowRewardNotification(true);
    
    setTimeout(() => {
      setShowRewardNotification(false);
    }, 3000);
  };

  // Demo functions to trigger rewards
  const triggerTaskReward = () => {
    window.dispatchEvent(new Event('taskCompleted'));
  };

  const triggerBigThreeReward = () => {
    window.dispatchEvent(new Event('bigThreeCompleted'));
  };

  const triggerMilestoneReward = () => {
    window.dispatchEvent(new Event('milestoneReached'));
  };

  return (
    <div className="space-y-6">
      {/* Reward Notification */}
      {showRewardNotification && lastReward && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-none shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              {lastReward.type === 'coins' ? (
                <Coins className="w-8 h-8 text-white" />
              ) : (
                <Star className="w-8 h-8 text-white" />
              )}
              <div className="text-white">
                <div className="font-bold text-lg">+{lastReward.amount}</div>
                <div className="text-sm opacity-90">
                  {lastReward.type === 'coins' ? 'Coins Earned!' : 'Special Currency!'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Rewards Summary */}
      <Card className="bg-white border border-pink-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Today's Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-100 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{dailyStats.dailyCoins}</div>
              <div className="text-sm text-yellow-600">Coins Earned</div>
            </div>
            
            <div className="text-center p-3 bg-purple-100 rounded-lg">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{dailyStats.specialCurrencyEarned}</div>
              <div className="text-sm text-purple-600">Special Currency</div>
            </div>
            
            <div className="text-center p-3 bg-indigo-100 rounded-lg">
              <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-700">{dailyStats.completedTasks}</div>
              <div className="text-sm text-indigo-600">Tasks Done</div>
            </div>
            
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{dailyStats.streakBonus}</div>
              <div className="text-sm text-blue-600">Streak Bonus</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earning Guide */}
      <Card className="bg-white/80 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            How to Earn Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-700">Complete any task</span>
              <Badge className="bg-yellow-100 text-yellow-700">
                <Coins className="w-3 h-3 mr-1" />
                {REWARD_RATES.TASK_COMPLETION} coins
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-700">Complete Big Three task</span>
              <Badge className="bg-yellow-100 text-yellow-700">
                <Coins className="w-3 h-3 mr-1" />
                +{REWARD_RATES.BIG_THREE_BONUS} bonus
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-700">Daily streak</span>
              <Badge className="bg-yellow-100 text-yellow-700">
                <Coins className="w-3 h-3 mr-1" />
                {REWARD_RATES.DAILY_STREAK} coins/day
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-700">Weekly goal completion</span>
              <Badge className="bg-yellow-100 text-yellow-700">
                <Coins className="w-3 h-3 mr-1" />
                {REWARD_RATES.WEEKLY_GOAL} coins
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-700">Reach major milestones</span>
              <Badge className="bg-purple-100 text-purple-700">
                <Star className="w-3 h-3 mr-1" />
                {REWARD_RATES.MILESTONE_SPECIAL} special
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Buttons (for testing) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-700">Demo Rewards (Testing)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={triggerTaskReward}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Simulate Task Complete
            </button>
            <button
              onClick={triggerBigThreeReward}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Simulate Big Three
            </button>
            <button
              onClick={triggerMilestoneReward}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Simulate Milestone
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}