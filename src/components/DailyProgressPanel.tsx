import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Flame, Trophy } from "lucide-react";
import { onChanged } from "@/lib/bus";
import { readPetStage } from "@/lib/topbarState";
import { readTrophies } from "@/lib/topbar.readers";
import focusTimer from "@/lib/focusTimer";

export default function DailyProgressPanel() {
  const [taskProgress, setTaskProgress] = useState(0);
  const [focusProgress, setFocusProgress] = useState(0);
  const [trophyCount, setTrophyCount] = useState(0);
  const [timerState, setTimerState] = useState(focusTimer.getState());

  useEffect(() => {
    // Load initial data
    const petData = readPetStage();
    setTaskProgress((petData.stage / 3) * 100);
    setTrophyCount(readTrophies());
    
    // Listen for data changes
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_tasks_v1")) {
        const updatedPetData = readPetStage();
        setTaskProgress((updatedPetData.stage / 3) * 100);
      }
      if (keys.includes("fm_pomo_trophies_v1")) {
        setTrophyCount(readTrophies());
      }
    });

    // Timer updates
    const unsubscribeTimer = focusTimer.on("tick", (state) => {
      setTimerState(state);
      const dailyProgress = Math.min((state.cycleCount / state.dailyGoal) * 100, 100);
      setFocusProgress(dailyProgress);
    });

    return () => {
      unsubscribe();
      unsubscribeTimer();
    };
  }, []);

  const progressItems = [
    {
      icon: Target,
      label: "Big Three Tasks",
      progress: taskProgress,
      color: "bg-blue-500",
      description: `${Math.round(taskProgress)}% complete`
    },
    {
      icon: CheckCircle,
      label: "Focus Sessions",
      progress: focusProgress,
      color: "bg-red-500",
      description: `${timerState.cycleCount}/${timerState.dailyGoal} sessions`
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Daily Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          );
        })}
        
        {/* Trophy streak display */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Today's Trophies</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {trophyCount} earned
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}