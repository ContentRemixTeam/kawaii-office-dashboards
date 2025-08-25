import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Target, Flame, Trophy, HelpCircle } from "lucide-react";
import { onChanged } from "@/lib/bus";
import { readPetStage } from "@/lib/topbarState";
import { getTrophyStats } from "@/lib/trophySystem";
import focusTimer from "@/lib/focusTimer";

export default function DailyProgressPanel() {
  const [taskProgress, setTaskProgress] = useState(0);
  const [focusProgress, setFocusProgress] = useState(0);
  const [trophyCount, setTrophyCount] = useState(0);
  const [timerState, setTimerState] = useState(focusTimer.getState());

  const loadData = () => {
    // Load task progress
    const petData = readPetStage();
    console.log('Loading pet data:', petData);
    setTaskProgress((petData.stage / 3) * 100);
    
    // Load trophy count from trophy system
    const trophyStats = getTrophyStats();
    console.log('Loading trophy stats:', trophyStats);
    setTrophyCount(trophyStats.todayTrophies || 0);
    
    // Load timer state
    const currentTimerState = focusTimer.getState();
    setTimerState(currentTimerState);
    const dailyProgress = Math.min((currentTimerState.cycleCount / currentTimerState.dailyGoal) * 100, 100);
    setFocusProgress(dailyProgress);
  };

  useEffect(() => {
    loadData();
    
    // Listen for data changes using the correct storage keys
    const unsubscribe = onChanged(keys => {
      console.log('DailyProgressPanel - Changed keys:', keys);
      if (keys.includes("fm_tasks_v1")) {
        const updatedPetData = readPetStage();
        console.log('Updated pet data:', updatedPetData);
        setTaskProgress((updatedPetData.stage / 3) * 100);
      }
      if (keys.includes("fm_trophies_v1") || keys.includes("fm_trophy_stats_v1")) {
        const trophyStats = getTrophyStats();
        console.log('Updated trophy stats:', trophyStats);
        setTrophyCount(trophyStats.todayTrophies || 0);
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
      description: `${Math.round(taskProgress)}% complete`,
      tooltip: "Complete your 3 most important daily tasks to grow your task pet and build momentum"
    },
    {
      icon: CheckCircle,
      label: "Focus Sessions",
      progress: focusProgress,
      color: "bg-red-500", 
      description: `${timerState.cycleCount}/${timerState.dailyGoal} sessions`,
      tooltip: "Track Pomodoro focus sessions completed vs your daily goal to earn trophies and stay focused"
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
        <TooltipProvider>
          {progressItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Rewards earned from completing focus sessions and maintaining streaks</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {trophyCount} earned
              </Badge>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}