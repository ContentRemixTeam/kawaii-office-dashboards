import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Clock, 
  Gamepad2, 
  Star,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface GameStatsProps {
  totalGamesPlayed: number;
  favoriteGame: string;
  totalPlayTime: number;
  achievementsEarned: number;
  weeklyBalance: {
    gaming: number;
    productivity: number;
  };
  currentStreak: number;
}

export default function GameStats({
  totalGamesPlayed,
  favoriteGame,
  totalPlayTime,
  achievementsEarned,
  weeklyBalance,
  currentStreak
}: GameStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const productivityRatio = Math.round((weeklyBalance.productivity / (weeklyBalance.productivity + weeklyBalance.gaming)) * 100);

  return (
    <div className="space-y-6">
      {/* Personal Gaming Stats */}
      <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gamepad2 className="w-5 h-5 text-blue-500" />
            Gaming Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">{totalGamesPlayed}</div>
              <div className="text-xs text-muted-foreground">Games Played</div>
            </div>
            
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600">{formatTime(totalPlayTime)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>
          
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Favorite Game</span>
            </div>
            <div className="font-semibold text-foreground">{favoriteGame}</div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      <Card className="border-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{achievementsEarned}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
              🎯 First Win
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/30">
              🚀 Speed Run
            </Badge>
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
              💎 Perfect Score
            </Badge>
            {currentStreak >= 3 && (
              <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
                🔥 On Fire
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Balance */}
      <Card className="border-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Weekly Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Productivity</span>
              <span className="font-semibold text-green-600">{formatTime(weeklyBalance.productivity)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${productivityRatio}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gaming</span>
              <span className="font-semibold text-blue-600">{formatTime(weeklyBalance.gaming)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${100 - productivityRatio}%` }}
              />
            </div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div className="text-lg font-bold text-green-600">{productivityRatio}%</div>
            <div className="text-xs text-muted-foreground">Productivity Focus</div>
          </div>
        </CardContent>
      </Card>

      {/* Gaming Streak */}
      <Card className="border-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="text-3xl font-bold text-orange-600 mb-1">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Days in a row</div>
            <div className="mt-2 text-xs text-orange-600 font-medium">
              {currentStreak >= 7 ? '🔥 On fire!' : currentStreak >= 3 ? '🚀 Building momentum!' : '💪 Keep going!'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}