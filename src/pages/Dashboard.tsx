import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import { CelebrationNotesCard } from "@/components/dashboard/CelebrationNotesCard";
import { SidebarGroup } from "@/components/dashboard/SidebarGroup";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import GiphyCelebration from "@/components/GiphyCelebration";
import UnifiedModeAwareDashboard from "@/components/dashboard/UnifiedModeAwareDashboard";
import { eventBus } from "@/lib/eventBus";
import { initializeTasksFromIntention } from "@/lib/unifiedTasks";
import { readPetStage, readEarnedAnimals } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";
import { onChanged } from "@/lib/bus";
import { FeatureErrorBoundary } from "@/components/ErrorBoundary";
import { TodaysRewards } from "@/components/TodaysRewards";
import { Sparkles, Heart, Calendar } from "lucide-react";
import useDailyFlow from "@/hooks/useDailyFlow";
import { BigThreeCard } from "@/components/dashboard/BigThreeCard";
import DashboardTrophyCase from "@/components/DashboardTrophyCase";
import { AmbientPlayerCard } from "@/components/dashboard/AmbientPlayerCard";
import { FocusTimerCard } from "@/components/dashboard/FocusTimerCard";
import { WorkSessionCard } from "@/components/dashboard/WorkSessionCard";

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
    
    setTodayIntention(readTodayIntention());
    setEarnedAnimals(readEarnedAnimals());
    
    return unsubscribeFocus;
  }, [celebratePomodoro]);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged(keys => {
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
    <main className="min-h-screen body-gradient">
      {/* Responsive Dashboard Container */}
      <div className="dashboard-responsive-container">
        {/* Header Section */}
        <section className="dashboard-header">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Daily Dashboard Graphic Header */}
              <div className="w-full max-w-lg mx-auto">
                <img 
                  src="/assets/daily-dashboard-header.png" 
                  alt="Daily Dashboard - Complete your tasks to grow your daily companion!" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
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
        </section>

        {/* Mode-Aware Hero Section */}
        <section className="dashboard-hero">
          <FeatureErrorBoundary featureName="Mode-Aware Dashboard">
            <UnifiedModeAwareDashboard />
          </FeatureErrorBoundary>
        </section>

        {/* Three Main Cards - Big Three, Ambient Player, Focus Timer */}
        <section className="dashboard-primary-grid">
          <FeatureErrorBoundary featureName="Big Three Tasks">
            <div className="dashboard-card big-three-card">
              <BigThreeCard />
              
              {/* Quick Actions Below Big Three */}
              <div className="big-three-extension">
                <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/tools/focus')}
                        className="h-8 px-3 text-xs"
                      >
                        🎯 Focus
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/design')}
                        className="h-8 px-3 text-xs"
                      >
                        🗡️ Quest
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/tools/break-room')}
                        className="h-8 px-3 text-xs"
                      >
                        ☕ Break
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-background/50 rounded">
                      <div className="text-xs text-muted-foreground">Today</div>
                      <div className="text-sm font-semibold">2/3</div>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <div className="text-xs text-muted-foreground">This Week</div>
                      <div className="text-sm font-semibold">12/21</div>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <div className="text-xs text-muted-foreground">Streak</div>
                      <div className="text-sm font-semibold">🔥 3</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FeatureErrorBoundary>
          
          <FeatureErrorBoundary featureName="Ambient Player">
            <div className="dashboard-card">
              <AmbientPlayerCard />
            </div>
          </FeatureErrorBoundary>

          <FeatureErrorBoundary featureName="Focus Timer">
            <div className="dashboard-card">
              <FocusTimerCard />
            </div>
          </FeatureErrorBoundary>
        </section>

        {/* Dynamic Content Sections - Only show if content exists */}
        {(todayIntention || earnedAnimals.length > 0) && (
          <section className="dashboard-dynamic-content">
            {/* Today's Intention */}
            {todayIntention && (
              <FeatureErrorBoundary featureName="Today's Intention">
                <div className="dashboard-card">
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
            )}

            {/* Earned Pets */}
            {earnedAnimals.length > 0 && (
              <FeatureErrorBoundary featureName="Earned Pets">
                <div className="dashboard-card">
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
            )}
          </section>
        )}

        {/* Celebration Notes - Full Width */}
        <section className="dashboard-celebration">
          <FeatureErrorBoundary featureName="Celebration Notes">
            <div className="dashboard-card">
              <CelebrationNotesCard />
            </div>
          </FeatureErrorBoundary>
        </section>

        {/* Today's Rewards */}
        <section className="dashboard-section">
          <FeatureErrorBoundary featureName="Today's Rewards">
            <TodaysRewards />
          </FeatureErrorBoundary>
        </section>

        {/* Quick Access Tools */}
        <section className="dashboard-quick-access">
          <FeatureErrorBoundary featureName="Sidebar Tools">
            <SidebarGroup />
          </FeatureErrorBoundary>
        </section>

        {/* Footer Tips */}
        <section className="dashboard-footer">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              💡 Tip: Complete tasks to grow your pet and unlock new companions
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/80">
              <span>🐱 Pet Store Mode</span>
              <span>🏆 Trophy System</span>
              <span>💎 Focus Sessions</span>
            </div>
          </div>
        </section>
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