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
          </div>
          <Badge variant="outline" className="bg-background/80">
            {stats.totalTrophies} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.todayTrophies}</div>
        <p className="text-sm text-muted-foreground">earned today</p>
        
        {stats.currentStreak > 0 && (
          <div className="mt-3 p-2 bg-orange-100/50 rounded-lg">
            <span className="text-sm">🔥 {stats.currentStreak} session streak</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}