import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, Star, Target, Zap } from 'lucide-react';
import { getCurrencyData, getDailyCurrencyData, EARNING_RATES } from '@/lib/unifiedCurrency';
import { getDailyData } from '@/lib/storage';
import { onChanged } from '@/lib/bus';

interface RewardsStat {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

interface RewardRule {
  label: string;
  reward: string;
  type: 'coins' | 'special';
}

export function TodaysRewards() {
  const [dailyStats, setDailyStats] = useState({
    coinsEarned: 0,
    specialCurrency: 0,
    tasksDone: 0,
    streakBonus: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const dailyCurrency = getDailyCurrencyData();
      const taskData = getDailyData('fm_unified_tasks_v1', { tasks: [], completedToday: 0 });
      
      setDailyStats({
        coinsEarned: dailyCurrency.dailyEarned.coins,
        specialCurrency: dailyCurrency.dailyEarned.gems,
        tasksDone: taskData.completedToday || 0,
        streakBonus: Math.floor(dailyCurrency.dailyEarned.coins / 20) // Approximate streak bonus
      });
    };

    updateStats();
    const unsubscribe = onChanged((keys) => {
      if (keys.includes('fm_unified_currency_v1') || keys.includes('fm_unified_tasks_v1')) {
        updateStats();
      }
    });
    return unsubscribe;
  }, []);

  const stats: RewardsStat[] = [
    {
      icon: <Coins className="w-6 h-6" />,
      label: 'Coins Earned',
      value: dailyStats.coinsEarned,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: 'Special Currency',
      value: dailyStats.specialCurrency,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Tasks Done',
      value: dailyStats.tasksDone,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: 'Streak Bonus',
      value: dailyStats.streakBonus,
      color: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const rewardRules: RewardRule[] = [
    {
      label: 'Complete any task',
      reward: `${EARNING_RATES.TASK_COMPLETION.coins} coins`,
      type: 'coins'
    },
    {
      label: 'Complete Big Three task',
      reward: `+${EARNING_RATES.BIG_THREE_BONUS.coins - EARNING_RATES.TASK_COMPLETION.coins} bonus`,
      type: 'coins'
    },
    {
      label: 'Daily streak',
      reward: `${EARNING_RATES.DAILY_STREAK_2.coins} coins/day`,
      type: 'coins'
    },
    {
      label: 'Weekly goal completion',
      reward: `${EARNING_RATES.WEEKLY_GOAL.coins} coins`,
      type: 'coins'
    },
    {
      label: 'Reach major milestones',
      reward: `${EARNING_RATES.TROPHY_MILESTONE.gems} special`,
      type: 'special'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Today's Rewards Stats */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Gift className="w-5 h-5" />
            Today's Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`p-4 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-700', '-50')} border`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${stat.color.replace('bg-', 'bg-').replace('-100', '-200')} mb-2 mx-auto`}>
                  <div className={stat.color.split(' ')[1]}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Rewards */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Gift className="w-5 h-5" />
            How to Earn Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewardRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/20">
                <span className="text-sm font-medium text-foreground">
                  {rule.label}
                </span>
                <Badge 
                  variant={rule.type === 'special' ? 'default' : 'secondary'}
                  className={`font-semibold ${
                    rule.type === 'special' 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {rule.type === 'coins' && <Coins className="w-3 h-3 mr-1" />}
                  {rule.type === 'special' && <Star className="w-3 h-3 mr-1" />}
                  {rule.reward}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}