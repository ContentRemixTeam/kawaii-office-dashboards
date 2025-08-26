import { useState, useEffect } from 'react';
import { getUnifiedTaskData } from '@/lib/unifiedTasks';
import { normalizePetKey } from '@/lib/pets';
import type { PetKey } from '@/lib/celebrations';

/**
 * Hook to get today's selected pet, normalized and ready for celebrations
 * @returns Normalized pet key or 'general' as fallback
 */
export function useTodayPet(): PetKey | 'general' {
  const [petKey, setPetKey] = useState<PetKey | 'general'>('general');

  useEffect(() => {
    // Get current pet from unified task data
    const updatePet = () => {
      const taskData = getUnifiedTaskData();
      const normalized = normalizePetKey(taskData.selectedAnimal);
      setPetKey(normalized);
    };

    // Initial load
    updatePet();

    // Listen for task updates that might change the pet
    const handleTaskUpdate = () => updatePet();
    const handleStorageUpdate = () => updatePet();

    window.addEventListener('tasksUpdated', handleTaskUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('tasksUpdated', handleTaskUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return petKey;
}