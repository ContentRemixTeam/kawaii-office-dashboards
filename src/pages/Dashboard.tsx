import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DashboardPetHero from "@/components/DashboardPetHero";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import { DailyWinsTracker } from "@/components/DailyWinsTracker";
import { CelebrationNotesCard } from "@/components/dashboard/CelebrationNotesCard";

import { SidebarGroup } from "@/components/dashboard/SidebarGroup";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import GiphyCelebration from "@/components/GiphyCelebration";
import { eventBus } from "@/lib/eventBus";
import { initializeTasksFromIntention } from "@/lib/unifiedTasks";
import { readVisionThumbs, readPetStage, readEarnedAnimals } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";
import { onChanged } from "@/lib/bus";
import { FeatureErrorBoundary } from "@/components/ErrorBoundary";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import OfficeHero from "@/components/OfficeHero";
import { Sparkles, Heart, Calendar } from "lucide-react";
import useDailyFlow from "@/hooks/useDailyFlow";
import { BigThreeCard } from "@/components/dashboard/BigThreeCard";
import DashboardTrophyCase from "@/components/DashboardTrophyCase";
import { AmbientPlayerCard } from "@/components/dashboard/AmbientPlayerCard";
import { FocusTimerCard } from "@/components/dashboard/FocusTimerCard";

interface TaskData {
  tasks: string[];
  completed: boolean[];
  selectedAnimal: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const flow = useDailyFlow();
  const { 
    currentCelebration, 
    celebratePomodoro, 
    clearCelebration 
  } = useGiphyCelebration();
  
  const [visionImages, setVisionImages] = useState<string[]>([]);
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
    
    setVisionImages(readVisionThumbs(4));
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

  const boardHotspot = HOTSPOTS.find(h => h.id === 'board')!;

  return (
    <main className="min-h-screen body-gradient flex flex-col items-center py-6 px-4">
      <div className="text-center mb-8 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
            Your Daily Dashboard
          </h1>
          <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
        </div>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Complete your tasks to grow your daily companion!
        </p>
        {!todayIntention && (
          <div className="mt-6">
            <Button
              onClick={() => flow.setShowIntention(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Set Daily Intention
            </Button>
          </div>
        )}
      </div>

      {/* Hero Pet Section (Full Width) */}
      <div className="w-full max-w-6xl mb-8">
        <FeatureErrorBoundary featureName="Pet Growth Center">
          <DashboardPetHero />
        </FeatureErrorBoundary>
      </div>

      {/* Main Dashboard Grid */}
      <div className="w-full max-w-6xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trophy Case */}
        <FeatureErrorBoundary featureName="Trophy Case">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
            <DashboardTrophyCase />
          </div>
        </FeatureErrorBoundary>
        
        {/* Big Three Tasks */}
        <FeatureErrorBoundary featureName="Big Three Tasks">
          <BigThreeCard />
        </FeatureErrorBoundary>
      </div>

      {/* Secondary Tools Grid */}
      <div className="w-full max-w-6xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureErrorBoundary featureName="Ambient Player">
          <AmbientPlayerCard />
        </FeatureErrorBoundary>
        <FeatureErrorBoundary featureName="Focus Timer">
          <FocusTimerCard />
        </FeatureErrorBoundary>
      </div>

      {/* Daily Progress Section */}
      <div className="w-full max-w-6xl mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <FeatureErrorBoundary featureName="Daily Wins">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden h-full">
                <DailyWinsTracker />
              </div>
            </FeatureErrorBoundary>
          </div>
          
          <div className="lg:col-span-2">
            <FeatureErrorBoundary featureName="Celebration Notes">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden h-full">
                <CelebrationNotesCard />
              </div>
            </FeatureErrorBoundary>
          </div>
        </div>
      </div>

      {/* Today's Intention Section */}
      {todayIntention && (
        <div className="w-full max-w-6xl mb-8">
          <FeatureErrorBoundary featureName="Today's Intention">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-primary mb-1">✨ Today's Intention</h2>
                  <p className="text-sm text-muted-foreground">Your guiding focus for the day</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center text-center py-4"
                        onClick={() => navigate('/tools/tasks')}
                      >
                        <div className="space-y-2">
                          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full inline-block">
                            Feel: {todayIntention.feel}
                          </div>
                          {todayIntention.focus && (
                            <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full inline-block">
                              Focus: {todayIntention.focus}
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to modify intention</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </FeatureErrorBoundary>
        </div>
      )}

      {/* Vision Board Section */}
      <div className="w-full max-w-6xl mb-8">
        <FeatureErrorBoundary featureName="Vision Board">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-primary mb-1">🎯 Hold the Vision</h2>
                <p className="text-sm text-muted-foreground">Your vision board preview</p>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/20">
                <OfficeHero
                  hotspots={HOTSPOTS}
                  fallbackSrc={OFFICE_IMAGE_SRC}
                  alt={OFFICE_ALT}
                  aspectRatio={16/9}
                />
                <VisionPreviewOverlay boardBox={boardHotspot} />
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => navigate('/tools/vision')}
                  className="w-full"
                  variant="outline"
                >
                  Open Vision Board
                </Button>
              </div>
            </div>
          </div>
        </FeatureErrorBoundary>
      </div>

      {/* Today's Earned Pets */}
      {earnedAnimals.length > 0 && (
        <div className="w-full max-w-6xl mb-8">
          <FeatureErrorBoundary featureName="Earned Pets">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-primary mb-1">🏆 Today's Earned Pets</h2>
                  <p className="text-sm text-muted-foreground">Companions you've unlocked today</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mb-6">
                  {earnedAnimals.map((animal, index) => (
                    <div 
                      key={`${animal.id}-${index}`}
                      className="text-5xl animate-bounce hover:scale-110 transition-transform cursor-default p-4 rounded-xl bg-primary/5 border border-primary/20"
                      style={{ animationDelay: `${index * 0.3}s` }}
                      title={`Earned ${animal.id}!`}
                    >
                      {animal.emoji}
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-full inline-block">
                    🎯 {earnedAnimals.length} pets earned today!
                  </div>
                </div>
              </div>
            </div>
          </FeatureErrorBoundary>
        </div>
      )}

      {/* Quick Access Toolbar */}
      <div className="w-full max-w-6xl mb-8">
        <FeatureErrorBoundary featureName="Sidebar Tools">
          <SidebarGroup />
        </FeatureErrorBoundary>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          💡 Tip: Complete tasks to grow your pet and unlock new companions
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/80">
          <span>🐱 Task Pets</span>
          <span>🏆 Trophy System</span>
          <span>🎯 Vision Board</span>
          <span>💎 Focus Sessions</span>
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