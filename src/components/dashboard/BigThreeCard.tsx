import { Calendar, CheckCircle, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { safeStorage } from "@/lib/safeStorage";
import { useState, useEffect } from "react";
import { onChanged } from "@/lib/bus";
import { getBigThreeTasks, setBigThreeTasks, updateBigThreeTask, getBigThreeStats } from "@/lib/bigThreeTasks";
import { awardActivityCurrency, EARNING_RATES } from "@/lib/unifiedCurrency";
import { toast } from "@/hooks/use-toast";
import useDailyFlow from "@/hooks/useDailyFlow";
import { saveDailyWin } from "@/lib/dailyWins";
import { addEarnedAnimal } from "@/lib/topbarState";

// TypeScript interfaces for task data structure
interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

export function BigThreeCard() {
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });
  const [bigThreeTasks, setBigThreeTasksState] = useState<[any, any, any]>([null, null, null]);
  const { setShowIntention } = useDailyFlow();

  useEffect(() => {
    // Load initial dashboard data using safeStorage
    const defaultDashData: DashboardData = { streak: 0, lastCompletedDate: "" };
    const dashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
    setStreakData(dashData || defaultDashData);

    // Load tasks
    const tasks = getBigThreeTasks();
    setBigThreeTasksState(tasks);

    // Subscribe to storage changes using the existing bus system
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_dashboard_v1")) {
        const newDashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
        setStreakData(newDashData || defaultDashData);
      }
      if (keys.includes("fm_big_three_v1")) {
        const tasks = getBigThreeTasks();
        setBigThreeTasksState(tasks);
      }
    });

    return unsubscribe;
  }, []);

  const handleTaskChange = (index: number, value: string) => {
    const tasks = getBigThreeTasks();
    const newTitles = tasks.map((task, i) => 
      i === index ? value : (task?.title || "")
    );
    setBigThreeTasks(newTitles[0], newTitles[1], newTitles[2]);
  };

  const toggleTaskCompleted = (index: number) => {
    const task = bigThreeTasks[index];
    if (!task) return;
    
    const wasCompleted = task.completed;
    const nowCompleted = !wasCompleted;
    
    updateBigThreeTask(task.id, { completed: nowCompleted });
    
    // Award bonus coins when completing a Big Three task (not when uncompleting)
    if (nowCompleted && !wasCompleted) {
      // Award Big Three bonus coins
      const currencyData = awardActivityCurrency('BIG_THREE_BONUS', `bigThree-${task.title}`);
      
      // Save as daily win with task details
      saveDailyWin({
        taskTitle: task.title,
        taskIndex: index,
        celebrationNote: `Completed Big Three task: ${task.title}`,
        completedAt: new Date().toISOString()
      });
      
      // Show celebration toast with coin reward
      toast({
        title: "🎉 Big Three Complete!",
        description: `+${EARNING_RATES.BIG_THREE_BONUS.coins} bonus coins earned! 🪙`,
        duration: 4000,
      });
    
      // Add a random earned animal on Big Three completion
      addEarnedAnimal('bigthree-reward', '🌟');
    }
  };

  const stats = getBigThreeStats();
  const hasAnyTasks = bigThreeTasks.some(task => task?.title?.trim());

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-card-title flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            The Big Three
          </h2>
          <div className="status-indicator status-success">
            <Calendar className="w-4 h-4" />
            <span>
              {streakData.streak} day streak
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your top 3 must-dos to make today awesome! Check one off = +{EARNING_RATES.BIG_THREE_BONUS.coins} bonus coins! 🪙
        </p>
      </div>

      {/* Show prompt if no tasks are set */}
      {!hasAnyTasks && (
        <div className="text-center py-6 space-y-3 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
          <div className="text-4xl">✨</div>
          <p className="text-muted-foreground">Set your Big Three to start the day!</p>
          <Button
            variant="outline"
            onClick={() => setShowIntention(true)}
            className="gap-2"
          >
            ✨ Set Daily Intention
          </Button>
        </div>
      )}

      {/* Task Input Fields */}
      <div className="space-y-4">
        {[0, 1, 2].map((index) => {
          const task = bigThreeTasks[index];
          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                task?.completed
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-background/80 border-border/20 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <Checkbox
                checked={task?.completed || false}
                onCheckedChange={() => toggleTaskCompleted(index)}
                className="scale-125"
                disabled={!task?.title?.trim()}
              />
              <Input
                value={task?.title || ""}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className={`border-none bg-transparent text-base font-medium shadow-none focus-visible:ring-0 ${
                  task?.completed ? "line-through text-muted-foreground" : ""
                }`}
              />
              {task?.completed && (
                <div className="flex items-center gap-2 text-primary animate-bounce">
                  <Coins className="w-5 h-5" />
                  <span className="text-sm font-semibold">+{EARNING_RATES.BIG_THREE_BONUS.coins}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      {hasAnyTasks && (
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              {stats.completedCount} of {stats.totalCount} completed
            </span>
          </div>
          {stats.allCompleted && (
            <div className="text-sm text-primary font-semibold animate-pulse">
              Perfect day! ✨
            </div>
          )}
        </div>
      )}

      {/* Set Intention Button if tasks exist but want to update */}
      {hasAnyTasks && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowIntention(true)}
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
        >
          Update Daily Intention
        </Button>
      )}
    </div>
  );
}