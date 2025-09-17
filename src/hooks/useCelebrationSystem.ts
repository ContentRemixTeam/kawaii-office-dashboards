import { useState, useCallback, useEffect } from 'react';
import { audioSystem, SoundType } from '@/lib/audioSystem';
import { getCelebrationSettings } from '@/lib/storage';

export interface CelebrationEvent {
  type: 'task' | 'pomodoro' | 'micro-win' | 'all-tasks';
  taskType?: 'big-three' | 'regular' | 'habit';
  message?: string;
  showConfetti?: boolean;
  soundType?: SoundType;
}

export function useCelebrationSystem() {
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationEvent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load settings
  const settings = getCelebrationSettings();

  const celebrate = useCallback(async (event: CelebrationEvent) => {
    // Check if celebrations are enabled
    if (!settings.enabled) return;

    try {
      // Play sound if enabled
      if (settings.soundEnabled && event.soundType) {
        await audioSystem.playSound(event.soundType);
      }

      // Show visual celebration if enabled
      if (settings.popupsEnabled && !settings.minimalMode) {
        setCurrentCelebration(event);
        
        // Show confetti for appropriate events
        if (event.showConfetti !== false) {
          setShowConfetti(true);
        }
      }
    } catch (error) {
      console.warn('Celebration failed:', error);
    }
  }, [settings]);

  const clearCelebration = useCallback(() => {
    setCurrentCelebration(null);
    setShowConfetti(false);
  }, []);

  // Convenience methods for common celebrations
  const celebrateTaskCompletion = useCallback((taskType: 'big-three' | 'regular' | 'habit' = 'regular') => {
    const soundMap: Record<typeof taskType, SoundType> = {
      'big-three': 'big-three',
      'regular': 'task-complete',
      'habit': 'habit-complete'
    };

    celebrate({
      type: 'task',
      taskType,
      showConfetti: true,
      soundType: soundMap[taskType],
      message: getTaskCompletionMessage(taskType)
    });
  }, [celebrate]);

  const celebratePomodoroCompletion = useCallback(() => {
    celebrate({
      type: 'pomodoro',
      showConfetti: true,
      soundType: 'pomodoro-complete',
      message: 'Focus session complete! 🎉'
    });
  }, [celebrate]);

  const celebrateMicroWin = useCallback((message?: string) => {
    celebrate({
      type: 'micro-win',
      showConfetti: false,
      soundType: 'micro-win',
      message: message || 'Micro win logged! 🌟'
    });
  }, [celebrate]);

  const celebrateAllTasksComplete = useCallback(() => {
    celebrate({
      type: 'all-tasks',
      showConfetti: true,
      soundType: 'celebration',
      message: 'All tasks complete! Amazing work! 🎊'
    });
  }, [celebrate]);

  return {
    currentCelebration,
    showConfetti,
    celebrateTaskCompletion,
    celebratePomodoroCompletion,
    celebrateMicroWin,
    celebrateAllTasksComplete,
    clearCelebration,
    settings,
    isEnabled: settings.enabled
  };
}

function getTaskCompletionMessage(taskType: 'big-three' | 'regular' | 'habit'): string {
  const messages = {
    'big-three': [
      'Big Three task completed! 🏆',
      'Major task crushed! 💪',
      'Priority task done! ⭐'
    ],
    'regular': [
      'Task completed! 🎉',
      'Nice work! ✨',
      'Task checked off! ✅'
    ],
    'habit': [
      'Habit completed! 🌟',
      'Consistency wins! 💫',
      'Habit streak! 🔥'
    ]
  };

  const typeMessages = messages[taskType];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}