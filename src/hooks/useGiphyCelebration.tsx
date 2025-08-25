import { useState, useCallback } from "react";
import { GiphyCelebrationPayload } from "@/components/GiphyCelebration";

export function useGiphyCelebration() {
  const [currentCelebration, setCurrentCelebration] = useState<GiphyCelebrationPayload | null>(null);

  const celebrate = useCallback((payload: GiphyCelebrationPayload) => {
    setCurrentCelebration(payload);
  }, []);

  const clearCelebration = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  const celebrateTask = useCallback((petType?: string, taskNumber?: number) => {
    celebrate({
      type: 'task',
      petType,
      taskNumber
    });
  }, [celebrate]);

  const celebratePomodoro = useCallback((petType?: string) => {
    celebrate({
      type: 'pomodoro',
      petType
    });
  }, [celebrate]);

  const celebrateAllTasks = useCallback((petType?: string) => {
    celebrate({
      type: 'all-tasks',
      petType
    });
  }, [celebrate]);

  return {
    currentCelebration,
    celebrate,
    celebrateTask,
    celebratePomodoro,
    celebrateAllTasks,
    clearCelebration
  };
}