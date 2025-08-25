import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ExternalLink, Crown, Medal, Award } from "lucide-react";
import { getTrophies, getTrophyStats, getTrophyCountsByType, type Trophy as TrophyType } from "@/lib/trophySystem";
import { onChanged } from "@/lib/bus";

export default function DashboardTrophyCase() {
  const navigate = useNavigate();
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [stats, setStats] = useState({ totalTrophies: 0, todayTrophies: 0, currentStreak: 0, bestStreak: 0 });
  const [counts, setCounts] = useState({ basic: 0, silver: 0, gold: 0, diamond: 0 });

  const loadTrophyData = () => {
    const allTrophies = getTrophies();
    const trophyStats = getTrophyStats();
    const typeCounts = getTrophyCountsByType();
    
    setTrophies(allTrophies);
    setStats(trophyStats);
    setCounts(typeCounts);
  };

  useEffect(() => {
    loadTrophyData();
  }, []);

  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      if (keys.some(key => key.includes("trophy") || key.includes("trophies"))) {
        loadTrophyData();
      }
    });
    return unsubscribe;
  }, []);

  const recentTrophies = trophies
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 6);

  const getTrophyIcon = (type: string) => {
    switch (type) {
      case 'diamond': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'gold': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'silver': return <Medal className="w-4 h-4 text-gray-600" />;
      default: return <Award className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTrophyGradient = (type: string) => {
    switch (type) {
      case 'diamond': return "from-purple-500/20 to-indigo-500/20 border-purple-300/50";
      case 'gold': return "from-yellow-500/20 to-amber-500/20 border-yellow-300/50";
      case 'silver': return "from-gray-400/20 to-slate-500/20 border-gray-300/50";
      default: return "from-amber-500/20 to-orange-500/20 border-amber-300/50";
    }
  };

  if (stats.totalTrophies === 0) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50/50 to-amber-50/50 border-yellow-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Trophy Case
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tools/focus')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              Start Earning
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm text-muted-foreground">Complete focus sessions to earn trophies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50/50 to-amber-50/50 border-yellow-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Trophy Case
            <Badge variant="outline" className="bg-background/80">
              {stats.todayTrophies} today
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tools/focus')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Focus Session
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-purple-600">{counts.diamond}</div>
            <div className="text-xs text-muted-foreground">👑</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-yellow-600">{counts.gold}</div>
            <div className="text-xs text-muted-foreground">🏆</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-600">{counts.silver}</div>
            <div className="text-xs text-muted-foreground">🥈</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-amber-600">{counts.basic}</div>
            <div className="text-xs text-muted-foreground">🏆</div>
          </div>
        </div>

        {/* Recent Trophies Display */}
        {recentTrophies.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Recent Wins</div>
            <div className="grid grid-cols-3 gap-2">
              {recentTrophies.slice(0, 6).map((trophy) => (
                <div
                  key={trophy.id}
                  className={`p-2 rounded-lg border text-center transition-all hover:scale-105 ${getTrophyGradient(trophy.type)}`}
                  title={`${trophy.name} - ${trophy.description}`}
                >
                  <div className="text-lg mb-1">{trophy.emoji}</div>
                  <div className="text-xs text-muted-foreground">
                    Streak {trophy.sessionStreak}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Streak */}
        {stats.currentStreak > 0 && (
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-100/50 to-red-100/50 rounded-lg border border-orange-200/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🔥 Current Streak</span>
            </div>
            <Badge variant="outline" className="bg-background/80">
              {stats.currentStreak} session{stats.currentStreak !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}