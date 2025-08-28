/**
 * Bulletproof Dashboard Implementation
 * Uses standardized cards with comprehensive error handling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulletproofCard } from './BulletproofCard';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Component imports
import { AmbientPlayerCard } from '@/components/dashboard/AmbientPlayerCard';
import { BigThreeCard } from '@/components/dashboard/BigThreeCard';
import { FocusTimerCard } from '@/components/dashboard/FocusTimerCard';
import { SidebarGroup } from '@/components/dashboard/SidebarGroup';
import DashboardHabitTracker from '@/components/DashboardHabitTracker';
import DashboardTrophyCase from '@/components/DashboardTrophyCase';
import { RecentWinsPanel } from '@/components/RecentWinsPanel';
import PetStatusCard from '@/components/PetStatusCard';
import { useGiphyCelebration } from '@/hooks/useGiphyCelebration';
import GiphyCelebration from '@/components/GiphyCelebration';

// State management
import { eventBus } from '@/lib/eventBus';
import { getDailyData } from '@/lib/storage';
import { getUnifiedTaskData, getBigThreeTasks } from '@/lib/unifiedTasks';
import { readVisionThumbs, readPetStage, readEarnedAnimals } from '@/lib/topbarState';
import { readTodayIntention } from '@/lib/dailyFlow';
import { onChanged } from '@/lib/bus';
import useBulletproofState from '@/hooks/useBulletproofState';
import { z } from 'zod';

// ===== SCHEMAS =====

const TaskDataSchema = z.object({
  tasks: z.array(z.string()),
  completed: z.array(z.boolean()),
  selectedAnimal: z.string()
});

const PetDataSchema = z.object({
  animal: z.string().nullable().optional(),
  stage: z.number()
});

// ===== DASHBOARD COMPONENT =====

export const BulletproofDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentCelebration, 
    celebratePomodoro, 
    clearCelebration 
  } = useGiphyCelebration();

  // Bulletproof state management
  const visionImages = useBulletproofState({
    key: 'fm_vision_thumbs_v1',
    schema: z.array(z.string()),
    defaultValue: [],
    persist: false // This is read-only from external source
  });

  const taskData = useBulletproofState({
    key: 'fm_dashboard_tasks_v1',
    schema: TaskDataSchema,
    defaultValue: { 
      tasks: ['', '', ''], 
      completed: [false, false, false], 
      selectedAnimal: 'unicorn' 
    }
  });

  const petData = useBulletproofState({
    key: 'fm_dashboard_pet_v1',
    schema: PetDataSchema,
    defaultValue: { stage: 0 }
  });

  const todayIntention = useBulletproofState({
    key: 'fm_dashboard_intention_v1',
    schema: z.any().nullable(),
    defaultValue: null,
    persist: false
  });

  const earnedAnimals = useBulletproofState({
    key: 'fm_dashboard_earned_v1',
    schema: z.array(z.object({
      id: z.string(),
      emoji: z.string()
    })),
    defaultValue: [],
    persist: false
  });

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        // Load external data sources
        visionImages.setValue(readVisionThumbs(4));
        petData.setValue(readPetStage());
        todayIntention.setValue(readTodayIntention());
        earnedAnimals.setValue(readEarnedAnimals());

        // Load task data
        const unifiedData = getUnifiedTaskData();
        const tasks = getBigThreeTasks();
        const loadedTaskData = {
          tasks: tasks.map(t => t?.title || ''),
          completed: tasks.map(t => t?.completed || false),
          selectedAnimal: unifiedData.selectedAnimal
        };
        taskData.setValue(loadedTaskData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();

    // Subscribe to focus session completions
    const unsubscribeFocus = eventBus.on('FOCUS_SESSION_ENDED', (data) => {
      if (data.phase === 'focus') {
        try {
          const currentPetData = readPetStage();
          celebratePomodoro(currentPetData.animal);
        } catch (error) {
          console.error('Failed to celebrate pomodoro:', error);
        }
      }
    });

    return unsubscribeFocus;
  }, []);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      try {
        if (keys.includes('fm_vision_v1')) {
          visionImages.setValue(readVisionThumbs(4));
        }
        if (keys.includes('fm_tasks_v1')) {
          const newPetData = readPetStage();
          const taskFallback = { tasks: ['', '', ''], completed: [false, false, false], selectedAnimal: 'unicorn' };
          const newTaskData = getDailyData('fm_tasks_v1', taskFallback);
          petData.setValue(newPetData);
          taskData.setValue(newTaskData);
        }
        if (keys.includes('fm_daily_intention_v1')) {
          todayIntention.setValue(readTodayIntention());
        }
        if (keys.includes('fm_earned_animals_v1')) {
          earnedAnimals.setValue(readEarnedAnimals());
        }
      } catch (error) {
        console.error('Failed to handle data changes:', error);
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
          <BulletproofCard
            title="Ambient Player"
            icon={undefined}
            variant="elevated"
            retryable={true}
            dismissible={false}
          >
            <AmbientPlayerCard />
          </BulletproofCard>
          
          <BulletproofCard
            title="Big Three Tasks"
            icon={undefined}
            variant="elevated"
            retryable={true}
            dismissible={false}
          >
            <BigThreeCard />
          </BulletproofCard>
        </div>

        {/* MAIN BAND: two vertical stacks under the same two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 layout-grid-gap-lg items-start">
          {/* LEFT STACK: Focus Timer → Daily Wins → Hold the Vision */}
          <div className="layout-spacing-md">
            <BulletproofCard
              title="Focus Timer"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
            >
              <FocusTimerCard />
            </BulletproofCard>
            
            <BulletproofCard
              title="Daily Wins"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
            >
              <RecentWinsPanel />
            </BulletproofCard>
            
            <BulletproofCard
              title="Hold the Vision"
              subtitle="Your vision board preview"
              variant="elevated"
              retryable={true}
              dismissible={false}
              loading={visionImages.isLoading}
              error={visionImages.error}
            >
              {visionImages.value.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {visionImages.value.slice(0, 4).map((image, index) => (
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
            </BulletproofCard>
          </div>
          
          {/* RIGHT STACK: Trophy Case → Pet Companion → Habit Garden → Today's Intention */}
          <div className="layout-spacing-md">
            <BulletproofCard
              title="Trophy Case"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
            >
              <DashboardTrophyCase />
            </BulletproofCard>
            
            <BulletproofCard
              title="Pet Companion"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
              loading={petData.isLoading || taskData.isLoading}
              error={petData.error || taskData.error}
            >
              <PetStatusCard 
                petData={{ animal: petData.value.animal || null, stage: petData.value.stage }}
                completedTasks={taskData.value.completed.filter(Boolean).length}
                totalTasks={taskData.value.tasks.filter(task => task.trim() !== '').length}
              />
            </BulletproofCard>
            
            <BulletproofCard
              title="Habit Garden"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
            >
              <DashboardHabitTracker />
            </BulletproofCard>
            
            <BulletproofCard
              title="Today's Intention"
              icon={undefined}
              variant="elevated"
              className="mb-6"
              retryable={true}
              dismissible={false}
              loading={todayIntention.isLoading}
              error={todayIntention.error}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center text-center py-4"
                      onClick={() => navigate('/tools/tasks')}
                    >
                      <div className="text-4xl mb-4">✨</div>
                      <div className="text-subtle">
                        {todayIntention.value ? (
                          <div className="space-y-2">
                            <div className="status-indicator status-success">
                              Feel: {todayIntention.value.feel}
                            </div>
                            {todayIntention.value.focus && (
                              <div className="status-indicator status-progress">
                                Focus: {todayIntention.value.focus}
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
            </BulletproofCard>

            {/* Today's Earned Pets */}
            {earnedAnimals.value.length > 0 && (
              <BulletproofCard
                title="Today's Earned Pets"
                icon={undefined}
                variant="success"
                retryable={true}
                dismissible={true}
                loading={earnedAnimals.isLoading}
                error={earnedAnimals.error}
              >
                <div className="flex flex-wrap gap-4 justify-center mb-6">
                  {earnedAnimals.value.map((animal, index) => (
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
                    🎯 {earnedAnimals.value.length} pets earned today!
                  </div>
                </div>
              </BulletproofCard>
            )}
          </div>
        </div>

        {/* OPTIONAL SIDEBAR GROUP: below main bands */}
        <BulletproofCard
          title="Additional Tools"
          variant="glass"
          collapsible={true}
          dismissible={true}
          retryable={false}
        >
          <SidebarGroup />
        </BulletproofCard>
        
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

export default BulletproofDashboard;