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
import { getUnifiedTaskData, getBigThreeTasks, initializeTasksFromIntention } from "@/lib/unifiedTasks";
import { readVisionThumbs, readPetStage, readEarnedAnimals } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";
import { onChanged } from "@/lib/bus";
import { FeatureErrorBoundary } from "@/components/ErrorBoundary";

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
    
    // Initialize tasks from intention if needed
    initializeTasksFromIntention();
    
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
    <main className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20">
      {/* Top spacing for fixed bar */}
      <div className="h-16" />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 layout-container-dashboard layout-spacing-sm">

        {/* TOP BAND: exactly two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 layout-grid-gap-lg items-start">
          <FeatureErrorBoundary featureName="Ambient Player">
            <div className="card-standard">
              <AmbientPlayerCard />
            </div>
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Big Three Tasks">
            <div className="card-standard">
              <BigThreeCard />
            </div>
          </FeatureErrorBoundary>
        </div>

        {/* MAIN BAND: two vertical stacks under the same two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 layout-grid-gap-lg items-start">
          {/* LEFT STACK: Focus Timer → Daily Wins → Hold the Vision */}
          <div className="layout-spacing-md">
            <FeatureErrorBoundary featureName="Focus Timer">
              <div className="card-standard mb-6">
                <FocusTimerCard />
              </div>
            </FeatureErrorBoundary>
            
            <FeatureErrorBoundary featureName="Daily Wins">
              <div className="card-standard mb-6">
                <div className="p-6">
                  <RecentWinsPanel />
                </div>
              </div>
            </FeatureErrorBoundary>
            
            <FeatureErrorBoundary featureName="Vision Board">
              <div className="card-standard">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-card-title flex items-center gap-3">
                      <span className="text-2xl">🌈</span>
                      Hold the Vision
                    </h2>
                  </div>
                  {visionImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {visionImages.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden bg-muted/10 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group"
                          onClick={() => navigate('/tools/vision')}
                        >
                          <img
                            src={image}
                            alt={`Vision ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center mb-6 border border-muted/20">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🌟</div>
                        <p className="text-caption">Add images to your vision board</p>
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
                </div>
              </div>
            </FeatureErrorBoundary>
          </div>
          
          {/* RIGHT STACK: Trophy Case → Pet Companion → Habit Garden → Today's Intention */}
          <div className="layout-spacing-md">
            <FeatureErrorBoundary featureName="Trophy Case">
              <div className="card-standard mb-6">
                <div className="p-6">
                  <DashboardTrophyCase />
                </div>
              </div>
            </FeatureErrorBoundary>
            
            <FeatureErrorBoundary featureName="Pet Companion">
              <div className="card-standard mb-6">
                <div className="p-6">
                  <PetStatusCard 
                    petData={petData}
                    completedTasks={taskData.completed.filter(Boolean).length}
                    totalTasks={taskData.tasks.filter(task => task.trim() !== "").length}
                  />
                </div>
              </div>
            </FeatureErrorBoundary>
            
            <FeatureErrorBoundary featureName="Habit Tracker">
              <div className="card-standard mb-6">
                <div className="p-6">
                  <DashboardHabitTracker />
                </div>
              </div>
            </FeatureErrorBoundary>
            
            <FeatureErrorBoundary featureName="Daily Intention">
              <div className="card-standard mb-6">
                <div className="p-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center text-center py-4"
                          onClick={() => navigate('/tools/tasks')}
                        >
                          <div className="text-4xl mb-4">✨</div>
                          <div className="text-card-title mb-3">Today's Intention</div>
                          <div className="text-subtle">
                            {todayIntention ? (
                              <div className="space-y-2">
                                <div className="status-indicator status-success">
                                  Feel: {todayIntention.feel}
                                </div>
                                {todayIntention.focus && (
                                  <div className="status-indicator status-progress">
                                    Focus: {todayIntention.focus}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="status-indicator status-muted">
                                Click to set your intention
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to set intention</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </FeatureErrorBoundary>

            {/* Today's Earned Pets */}
            {earnedAnimals.length > 0 && (
              <FeatureErrorBoundary featureName="Earned Pets">
                <div className="card-elevated">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-card-title flex items-center gap-3">
                        🏆 Today's Earned Pets
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mb-6">
                      {earnedAnimals.map((animal, index) => (
                        <div 
                          key={`${animal.id}-${index}`}
                          className="text-5xl animate-bounce hover:scale-110 transition-transform cursor-default p-2 rounded-xl bg-primary/5"
                          style={{ animationDelay: `${index * 0.3}s` }}
                          title={`Earned ${animal.id}!`}
                        >
                          {animal.emoji}
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="status-indicator status-success">
                        🎯 {earnedAnimals.length} pets earned today!
                      </div>
                    </div>
                  </div>
                </div>
              </FeatureErrorBoundary>
            )}
          </div>
        </div>

        {/* OPTIONAL SIDEBAR GROUP: below main bands, hidden in Minimal Mode or via toggles */}
        <SidebarGroup />
        
        {/* Footer tip */}
        <div className="text-center mt-12">
          <div className="card-glass inline-block">
            <div className="p-4">
              <p className="text-caption flex items-center gap-2">
                <span className="text-lg">💡</span>
                Your daily status is always visible in the top toolbar
              </p>
            </div>
          </div>
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