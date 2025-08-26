import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { AmbientPlayerCard } from "@/components/dashboard/AmbientPlayerCard";
import { BigThreeCard } from "@/components/dashboard/BigThreeCard";
import { FocusTimerCard } from "@/components/dashboard/FocusTimerCard";
import { SidebarGroup } from "@/components/dashboard/SidebarGroup";
import DashboardHabitTracker from "@/components/DashboardHabitTracker";
import DashboardTrophyCase from "@/components/DashboardTrophyCase";
import { RecentWinsPanel } from "@/components/RecentWinsPanel";
import PetStatusCard from "@/components/PetStatusCard";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import GiphyCelebration from "@/components/GiphyCelebration";
import { eventBus } from "@/lib/eventBus";
import { getDailyData } from "@/lib/storage";
import { getUnifiedTaskData, getBigThreeTasks } from "@/lib/unifiedTasks";
import { readVisionThumbs, readPetStage, readEarnedAnimals } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";
import { onChanged } from "@/lib/bus";

interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

interface TaskData {
  tasks: string[];
  completed: boolean[];
  selectedAnimal: string;
}

const ANIMALS = [
  { id: "unicorn", name: "Unicorn", emoji: "🦄", stages: ["🥚", "🐣", "🦄", "✨🦄✨"] },
  { id: "dragon", name: "Dragon", emoji: "🐉", stages: ["🥚", "🐣", "🐲", "🐉"] },
  { id: "phoenix", name: "Phoenix", emoji: "🔥", stages: ["🥚", "🐣", "🦅", "🔥"] },
  { id: "cat", name: "Cat", emoji: "🐱", stages: ["🥚", "🐣", "🐱", "😸"] },
  { id: "dog", name: "Dog", emoji: "🐶", stages: ["🥚", "🐣", "🐶", "🐕"] },
  { id: "rabbit", name: "Rabbit", emoji: "🐰", stages: ["🥚", "🐣", "🐰", "🌟🐰"] }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    currentCelebration, 
    celebratePomodoro, 
    clearCelebration 
  } = useGiphyCelebration();
  
  const [visionImages, setVisionImages] = useState<string[]>([]);
  const [petData, setPetData] = useState({ animal: null, stage: 0 });
  const [taskData, setTaskData] = useState<TaskData>({ tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" });
  const [todayIntention, setTodayIntention] = useState(null);
  const [earnedAnimals, setEarnedAnimals] = useState<Array<{ id: string; emoji: string }>>([]);

  // Load initial data
  useEffect(() => {
    // Subscribe to event bus for focus session completions
    const unsubscribeFocus = eventBus.on('FOCUS_SESSION_ENDED', (data) => {
      if (data.phase === 'focus') {
        // Get current pet for themed celebration
        const currentPetData = readPetStage();
        celebratePomodoro(currentPetData.animal);
      }
    });
    
    const unifiedData = getUnifiedTaskData();
    const tasks = getBigThreeTasks();
    const loadedTaskData = {
      tasks: tasks.map(t => t?.title || ""),
      completed: tasks.map(t => t?.completed || false),
      selectedAnimal: unifiedData.selectedAnimal
    };
    setTaskData(loadedTaskData);
    
    setVisionImages(readVisionThumbs(4));
    setPetData(readPetStage());
    setTodayIntention(readTodayIntention());
    setEarnedAnimals(readEarnedAnimals());
    
    return unsubscribeFocus;
  }, [celebratePomodoro]);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_vision_v1")) {
        setVisionImages(readVisionThumbs(4));
      }
      if (keys.includes("fm_tasks_v1")) {
        const newPetData = readPetStage();
        const taskFallback = { tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" };
        const newTaskData = getDailyData("fm_tasks_v1", taskFallback);
        setPetData(newPetData);
        setTaskData(newTaskData);
      }
      if (keys.includes("fm_daily_intention_v1")) {
        const newIntention = readTodayIntention();
        setTodayIntention(newIntention);
      }
      if (keys.includes("fm_earned_animals_v1")) {
        setEarnedAnimals(readEarnedAnimals());
      }
    });
    return unsubscribe;
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Top spacing for fixed bar */}
      <div className="h-16" />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* TOP BAND: exactly two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AmbientPlayerCard />
          <BigThreeCard />
        </div>

        {/* MAIN BAND: two vertical stacks under the same two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT STACK: Focus Timer → Daily Wins → Hold the Vision */}
          <div className="space-y-6">
            <FocusTimerCard />
            
            {/* Daily Wins */}
            <Card className="p-4 md:p-5">
              <RecentWinsPanel />
            </Card>
            
            {/* Hold the Vision */}
            <Card className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">🌈</span>
                  Hold the Vision ✨
                </h2>
              </div>
              {visionImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {visionImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-muted/20 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate('/tools/vision')}
                    >
                      <img
                        src={image}
                        alt={`Vision ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 rounded-lg bg-muted/20 flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <div className="text-3xl mb-2">🌟</div>
                    <p className="text-xs">Add images to your vision board</p>
                  </div>
                </div>
              )}
              <Button
                onClick={() => navigate('/tools/vision')}
                className="w-full"
                variant="outline"
                size="sm"
              >
                View Full Board
              </Button>
            </Card>
          </div>
          
          {/* RIGHT STACK: Trophy Case → Pet Companion → Habit Garden → Today's Intention */}
          <div className="space-y-6">
            {/* Trophy Case */}
            <Card className="p-4 md:p-5">
              <DashboardTrophyCase />
            </Card>
            
            {/* Pet Companion */}
            <Card className="p-4 md:p-5">
              <PetStatusCard 
                petData={petData}
                completedTasks={taskData.completed.filter(Boolean).length}
                totalTasks={taskData.tasks.filter(task => task.trim() !== "").length}
              />
            </Card>
            
            {/* Habit Garden */}
            <Card className="p-4 md:p-5">
              <DashboardHabitTracker />
            </Card>
            
            {/* Today's Intention */}
            <Card className="p-4 md:p-5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="cursor-pointer hover:scale-105 transition-transform flex flex-col justify-center text-center p-4"
                      onClick={() => navigate('/tools/tasks')}
                    >
                      <div className="text-3xl mb-3">✨</div>
                      <div className="text-lg font-semibold mb-2">Today's Intention</div>
                      <div className="text-sm text-muted-foreground">
                        {todayIntention ? (
                          <div className="space-y-1">
                            <div>Feel: {todayIntention.feel}</div>
                            {todayIntention.focus && <div>Focus: {todayIntention.focus}</div>}
                          </div>
                        ) : "Set your intention"}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to set intention</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Card>

            {/* Today's Earned Pets */}
            {earnedAnimals.length > 0 && (
              <Card className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    🏆 Today's Earned Pets
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                  {earnedAnimals.map((animal, index) => (
                    <div 
                      key={`${animal.id}-${index}`}
                      className="text-4xl animate-bounce hover:scale-110 transition-transform cursor-default"
                      style={{ animationDelay: `${index * 0.3}s` }}
                      title={`Earned ${animal.id}!`}
                    >
                      {animal.emoji}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Complete tasks to earn more pets! 🎉
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* OPTIONAL SIDEBAR GROUP: below main bands, hidden in Minimal Mode or via toggles */}
        <SidebarGroup />
        
        {/* Footer tip */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
            💡 Your daily status is always visible in the top toolbar
          </p>
        </div>
      </div>
      
      {/* GIPHY Celebration Component */}
      <GiphyCelebration
        payload={currentCelebration}
        onClose={clearCelebration}
      />
    </main>
  );
};

export default Dashboard;