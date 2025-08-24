import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Flame, Sprout, Calendar, Trash2, Edit } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { safeGet, safeSet, generateId, getTodayISO } from "@/lib/storage";
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

const HABIT_COLORS = [
  "bg-pink-500", "bg-purple-500", "bg-blue-500", "bg-green-500", 
  "bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-indigo-500"
];

const PLANT_STAGES = {
  0: "🌱", // seed (0 days)
  1: "🌿", // sprout (1-6 days)
  7: "🌸", // flower (7-20 days)
  21: "🌳"  // tree (21+ days)
};

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", emoji: "🌱", color: HABIT_COLORS[0] });
  const today = getTodayISO();

  useEffect(() => {
    const savedHabits = safeGet<Habit[]>("fm_habits_v1", []);
    const savedLogs = safeGet<HabitLog[]>("fm_habit_logs_v1", []);
    setHabits(savedHabits);
    setHabitLogs(savedLogs);
  }, []);

  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    safeSet("fm_habits_v1", newHabits);
  };

  const saveLogs = (newLogs: HabitLog[]) => {
    setHabitLogs(newLogs);
    safeSet("fm_habit_logs_v1", newLogs);
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;

    const habit: Habit = {
      id: generateId(),
      name: newHabit.name.trim(),
      emoji: newHabit.emoji,
      color: newHabit.color,
      created: today
    };

    saveHabits([...habits, habit]);
    setNewHabit({ name: "", emoji: "🌱", color: HABIT_COLORS[0] });
    setIsAddDialogOpen(false);
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

  const deleteHabit = (habitId: string) => {
    saveHabits(habits.filter(h => h.id !== habitId));
    saveLogs(habitLogs.filter(log => log.habitId !== habitId));
  };

  const getHabitStats = () => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => isCompletedToday(habit.id)).length;
    const totalStreaks = habits.reduce((sum, habit) => sum + getStreak(habit.id), 0);
    
    return { totalHabits, completedToday, totalStreaks };
  };

  const stats = getHabitStats();

  return (
    <ToolShell title="Habit Garden">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🌱 Growing Good Habits</h2>
          <p className="text-primary-foreground/90">
            Watch your habits bloom into beautiful plants! Each day you maintain a habit, your digital garden grows more vibrant and lush.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary">{stats.completedToday}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary">{stats.totalHabits}</div>
              <div className="text-sm text-muted-foreground">Plants</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary">{stats.totalStreaks}</div>
              <div className="text-sm text-muted-foreground">Total Streaks</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="garden" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="garden">🌿 My Garden</TabsTrigger>
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="garden" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Today's Watering</h3>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Plant New Habit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Plant a New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="habitName">Habit Name</Label>
                      <Input
                        id="habitName"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        placeholder="e.g., Drink 8 glasses of water"
                      />
                    </div>
                    <div>
                      <Label>Choose an Emoji</Label>
                      <div className="grid grid-cols-8 gap-2 mt-2">
                        {["🌱", "💧", "📚", "🏃", "🧘", "💤", "🍎", "✍️"].map((emoji) => (
                          <Button
                            key={emoji}
                            variant={newHabit.emoji === emoji ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewHabit({ ...newHabit, emoji })}
                            className="h-10"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Choose a Color</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {HABIT_COLORS.map((color) => (
                          <Button
                            key={color}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewHabit({ ...newHabit, color })}
                            className={cn(
                              "h-10",
                              newHabit.color === color && "ring-2 ring-primary"
                            )}
                          >
                            <div className={cn("w-6 h-6 rounded-full", color)} />
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={addHabit} className="w-full">
                      Plant Habit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {habits.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Sprout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your Garden Awaits</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Plant your first habit to start growing your beautiful garden
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Plant First Habit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((habit) => {
                  const streak = getStreak(habit.id);
                  const completed = isCompletedToday(habit.id);
                  const plant = getPlantStage(streak);

                  return (
                    <Card key={habit.id} className="p-4 relative group">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{habit.emoji}</span>
                            <div>
                              <h4 className="font-medium text-foreground text-sm">{habit.name}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Flame className="w-3 h-3 mr-1" />
                                  {streak}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{plant}</div>
                          <p className="text-xs text-muted-foreground">
                            {streak === 0 ? "Ready to grow" : 
                             streak === 1 ? "Growing strong" :
                             streak < 7 ? "Sprouting nicely" :
                             streak < 21 ? "Blooming beautiful" :
                             "Fully grown!"}
                          </p>
                        </div>

                        <Button
                          onClick={() => toggleHabitToday(habit.id)}
                          variant={completed ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                        >
                          {completed ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Watered Today
                            </>
                          ) : (
                            <>
                              💧 Water Plant
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Garden Overview</h3>
            
            {habits.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Data Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start tracking habits to see your progress overview
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const streak = getStreak(habit.id);
                  const completedDays = habitLogs.filter(log => 
                    log.habitId === habit.id && log.completed
                  ).length;

                  return (
                    <Card key={habit.id} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{habit.emoji}</span>
                            <div>
                              <h4 className="font-medium text-foreground">{habit.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Current streak: {streak} days</span>
                                <span>Total completed: {completedDays} days</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-3xl">{getPlantStage(streak)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToolShell>
  );
}