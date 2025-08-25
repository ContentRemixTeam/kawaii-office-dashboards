import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Sprout } from "lucide-react";
import { safeGet, safeSet, getTodayISO } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created: string;
}

interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
}

const PLANT_STAGES = {
  0: "🌱", // seed (0 days)
  1: "🌿", // sprout (1-6 days)
  7: "🌸", // flower (7-20 days)
  21: "🌳"  // tree (21+ days)
};

export default function DashboardHabitTracker() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const today = getTodayISO();

  useEffect(() => {
    const savedHabits = safeGet<Habit[]>("fm_habits_v1", []);
    const savedLogs = safeGet<HabitLog[]>("fm_habit_logs_v1", []);
    setHabits(savedHabits);
    setHabitLogs(savedLogs);
  }, []);

  const saveLogs = (newLogs: HabitLog[]) => {
    setHabitLogs(newLogs);
    safeSet("fm_habit_logs_v1", newLogs);
  };

  const toggleHabitToday = (habitId: string) => {
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === today);
    let newLogs: HabitLog[];

    if (existingLog) {
      // Toggle existing log
      newLogs = habitLogs.map(log => 
        log.habitId === habitId && log.date === today 
          ? { ...log, completed: !log.completed }
          : log
      );
    } else {
      // Create new log
      newLogs = [...habitLogs, { habitId, date: today, completed: true }];
    }

    saveLogs(newLogs);
  };

  const getStreak = (habitId: string): number => {
    const logs = habitLogs
      .filter(log => log.habitId === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (logs.length === 0) return 0;

    let streak = 0;
    const todayDate = new Date(today);
    
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      const daysDiff = Math.floor((todayDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getPlantStage = (streak: number): string => {
    if (streak === 0) return PLANT_STAGES[0];
    if (streak < 7) return PLANT_STAGES[1];
    if (streak < 21) return PLANT_STAGES[7];
    return PLANT_STAGES[21];
  };

  const isCompletedToday = (habitId: string): boolean => {
    return habitLogs.some(log => 
      log.habitId === habitId && log.date === today && log.completed
    );
  };

  const getHabitStats = () => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => isCompletedToday(habit.id)).length;
    const totalStreaks = habits.reduce((sum, habit) => sum + getStreak(habit.id), 0);
    
    return { totalHabits, completedToday, totalStreaks };
  };

  const stats = getHabitStats();

  if (habits.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Habit Garden
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tools/habits')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              Plant Habits
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-sm text-muted-foreground">Start your habit garden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Habit Garden
            <Badge variant="outline" className="bg-background/80">
              {stats.completedToday}/{stats.totalHabits} today
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tools/habits')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Full Garden
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Compact Habit List */}
        <div className="grid gap-2">
          {habits.slice(0, 4).map((habit) => {
            const streak = getStreak(habit.id);
            const completed = isCompletedToday(habit.id);
            const plantStage = getPlantStage(streak);

            return (
              <div
                key={habit.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg border transition-all",
                  completed 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-background/50 border-border/50 hover:border-green-300"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 flex-shrink-0",
                    completed ? "bg-green-600 hover:bg-green-700 text-white" : "hover:bg-green-100"
                  )}
                  onClick={() => toggleHabitToday(habit.id)}
                >
                  {completed ? <Check className="w-4 h-4" /> : habit.emoji}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{habit.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {streak > 0 && (
                      <span className="flex items-center gap-1">
                        {plantStage} {streak} day{streak !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show message if there are more habits */}
        {habits.length > 4 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{habits.length - 4} more habits in garden
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}