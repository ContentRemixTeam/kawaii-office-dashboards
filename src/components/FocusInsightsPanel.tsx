import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Flame, Sparkles, Target, TrendingUp, Clock } from "lucide-react";
import { getTrophyStats, getSessionLog } from "@/lib/trophySystem";
import { getRandomEncouragement } from "@/lib/encouragement";
import { onChanged } from "@/lib/bus";
import { safeGet } from "@/lib/storage";

interface WeeklyData {
  day: string;
  sessions: number;
}

interface StreakData {
  type: string;
  count: number;
  icon: string;
}

export default function FocusInsightsPanel() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState("");
  const [bestProductiveHour, setBestProductiveHour] = useState<string>("");

  useEffect(() => {
    loadInsightsData();
    
    const unsubscribe = onChanged(keys => {
      if (keys.some(key => key.includes("trophies") || key.includes("tasks") || key.includes("focus"))) {
        loadInsightsData();
      }
    });
    
    return unsubscribe;
  }, []);

  const loadInsightsData = () => {
    // Load weekly progress data
    const sessionLog = getSessionLog();
    const weeklyProgress = generateWeeklyData(sessionLog);
    setWeeklyData(weeklyProgress);

    // Load streak data
    const trophyStats = getTrophyStats();
    const taskData = safeGet("fm_tasks_v1", []);
    // Ensure taskData is always an array
    const tasks = Array.isArray(taskData) ? taskData : [];
    const completedToday = tasks.filter((task: any) => task.completed).length;
    
    setStreaks([
      { type: "Focus", count: trophyStats.currentStreak, icon: "🎯" },
      { type: "Tasks", count: completedToday, icon: "✅" },
      { type: "Days", count: Math.max(trophyStats.currentStreak, 1), icon: "📅" }
    ]);

    // Load recent achievements
    const achievements = generateRecentAchievements(sessionLog, tasks);
    setRecentAchievements(achievements);

    // Load productivity insights
    const productiveHour = findBestProductiveHour(sessionLog);
    setBestProductiveHour(productiveHour);

    // Set encouragement
    setEncouragement(getRandomEncouragement());
  };

  const generateWeeklyData = (sessionLog: any[]): WeeklyData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData: WeeklyData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      const sessionsCount = sessionLog.filter(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate.toDateString() === date.toDateString();
      }).length;

      weekData.push({
        day: dayName,
        sessions: sessionsCount
      });
    }

    return weekData;
  };

  const generateRecentAchievements = (sessionLog: any[], taskData: any[]): string[] => {
    const achievements: string[] = [];
    
    if (sessionLog.length > 0) {
      const today = new Date().toDateString();
      const todaySessions = sessionLog.filter(s => 
        new Date(s.timestamp).toDateString() === today
      ).length;
      
      if (todaySessions > 0) {
        achievements.push(`${todaySessions} focus session${todaySessions > 1 ? 's' : ''} today`);
      }
    }

    // Ensure taskData is an array before filtering
    const tasks = Array.isArray(taskData) ? taskData : [];
    const completedTasks = tasks.filter((task: any) => task.completed).length;
    if (completedTasks > 0) {
      achievements.push(`${completedTasks} task${completedTasks > 1 ? 's' : ''} completed`);
    }

    if (achievements.length === 0) {
      achievements.push("Ready for productivity!");
    }

    return achievements.slice(0, 3);
  };

  const findBestProductiveHour = (sessionLog: any[]): string => {
    if (sessionLog.length === 0) return "Start tracking to see insights";
    
    const hourCounts: { [key: number]: number } = {};
    
    sessionLog.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const bestHour = Object.entries(hourCounts).reduce((a, b) => 
      hourCounts[Number(a[0])] > hourCounts[Number(b[0])] ? a : b
    )[0];

    const hour = Number(bestHour);
    const timeStr = hour === 0 ? "12:00 AM" : 
                   hour < 12 ? `${hour}:00 AM` : 
                   hour === 12 ? "12:00 PM" : 
                   `${hour - 12}:00 PM`;
    
    return `Peak focus: ${timeStr}`;
  };

  const refreshMotivation = () => {
    setEncouragement(getRandomEncouragement());
  };

  const maxSessions = Math.max(...weeklyData.map(d => d.sessions), 1);

  return (
    <div className="space-y-4">
      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                <div 
                  className="bg-primary/20 rounded-sm transition-all"
                  style={{ 
                    height: `${Math.max((day.sessions / maxSessions) * 20, 2)}px`
                  }}
                />
                <div className="text-xs font-medium mt-1">{day.sessions}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Counter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4" />
            Streaks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {streaks.map((streak, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{streak.icon}</span>
                <span className="text-sm text-muted-foreground">{streak.type}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {streak.count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            Today's Wins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAchievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-xs text-muted-foreground">{achievement}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Energy Pattern Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-2">
            {bestProductiveHour}
          </div>
          <Progress value={75} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Quick Motivation Boost */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            Motivation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {encouragement}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMotivation}
            className="w-full h-8 text-xs"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            New Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}