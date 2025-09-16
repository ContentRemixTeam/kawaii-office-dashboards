import { getDailyData, setDailyData } from "@/lib/storage";
import { emitChanged } from "@/lib/bus";
import { z } from "zod";

// Pet task data structure - separate from Big Three
export interface PetTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface PetTaskData {
  tasks: PetTask[];
  selectedAnimal: string;
  reflections: string[];
  roundsCompleted: number;
  totalTasksCompleted: number;
  lastUpdated: string;
}

// Schema for validation
const PetTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

const PetTaskDataSchema = z.object({
  tasks: z.array(PetTaskSchema),
  selectedAnimal: z.string(),
  reflections: z.array(z.string()),
  roundsCompleted: z.number(),
  totalTasksCompleted: z.number(),
  lastUpdated: z.string(),
});

// Storage key
const PET_TASKS_KEY = "fm_pet_tasks_v1";

// Default data
const getDefaultPetTaskData = (): PetTaskData => ({
  tasks: [],
  selectedAnimal: "unicorn",
  reflections: ["", "", ""],
  roundsCompleted: 0,
  totalTasksCompleted: 0,
  lastUpdated: new Date().toISOString(),
});

// Generate unique ID
const generateTaskId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get pet task data
export const getPetTaskData = (): PetTaskData => {
  const data = getDailyData(PET_TASKS_KEY, getDefaultPetTaskData());
  
  // Validate and migrate if needed
  try {
    return PetTaskDataSchema.parse(data);
  } catch (error) {
    console.warn("Invalid pet task data structure, using default:", error);
    return getDefaultPetTaskData();
  }
};

// Save pet task data
export const savePetTaskData = (data: PetTaskData) => {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  
  setDailyData(PET_TASKS_KEY, updatedData);
  emitChanged([PET_TASKS_KEY]);
  
  // Emit legacy events for backward compatibility
  window.dispatchEvent(new CustomEvent('petTasksUpdated'));
  window.dispatchEvent(new Event('storage'));
};

// Get pet tasks (first 3)
export const getPetTasks = (): [PetTask | null, PetTask | null, PetTask | null] => {
  const data = getPetTaskData();
  return [
    data.tasks[0] || null,
    data.tasks[1] || null,
    data.tasks[2] || null,
  ];
};

// Set pet tasks (ensures exactly 3 tasks exist)
export const setPetTasks = (task1: string, task2: string, task3: string) => {
  const data = getPetTaskData();
  const tasks: PetTask[] = [];
  
  // Create or update the first 3 tasks
  [task1, task2, task3].forEach((title, index) => {
    if (title.trim()) {
      const existingTask = data.tasks[index];
      if (existingTask) {
        // Update existing task
        tasks.push({
          ...existingTask,
          title: title.trim(),
        });
      } else {
        // Create new task
        tasks.push({
          id: generateTaskId(),
          title: title.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  
  const updatedData = {
    ...data,
    tasks,
  };
  
  savePetTaskData(updatedData);
};

// Update a pet task
export const updatePetTask = (taskId: string, updates: Partial<PetTask>) => {
  const data = getPetTaskData();
  const taskIndex = data.tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    console.warn(`Pet task with id ${taskId} not found`);
    return;
  }
  
  const updatedTask = {
    ...data.tasks[taskIndex],
    ...updates,
  };
  
  // Set completedAt timestamp when marking as completed
  if (updates.completed === true && !data.tasks[taskIndex].completed) {
    updatedTask.completedAt = new Date().toISOString();
  } else if (updates.completed === false) {
    delete updatedTask.completedAt;
  }
  
  const updatedTasks = [...data.tasks];
  updatedTasks[taskIndex] = updatedTask;
  
  // Update completion stats
  let totalTasksCompleted = data.totalTasksCompleted;
  if (updates.completed === true && !data.tasks[taskIndex].completed) {
    totalTasksCompleted += 1;
  } else if (updates.completed === false && data.tasks[taskIndex].completed) {
    totalTasksCompleted = Math.max(0, totalTasksCompleted - 1);
  }
  
  const updatedData = {
    ...data,
    tasks: updatedTasks,
    totalTasksCompleted,
  };
  
  savePetTaskData(updatedData);
};

// Update selected animal
export const updateSelectedAnimal = (animalId: string) => {
  const data = getPetTaskData();
  const updatedData = {
    ...data,
    selectedAnimal: animalId,
  };
  
  savePetTaskData(updatedData);
};

// Update reflections
export const updateReflections = (reflections: string[]) => {
  const data = getPetTaskData();
  const updatedData = {
    ...data,
    reflections,
  };
  
  savePetTaskData(updatedData);
};

// Get pet task completion stats
export const getPetTaskStats = () => {
  const data = getPetTaskData();
  const completedCount = data.tasks.filter(task => task.completed).length;
  const totalCount = data.tasks.length;
  
  return {
    completedCount,
    totalCount,
    percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    allCompleted: totalCount > 0 && completedCount === totalCount,
  };
};