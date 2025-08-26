import { getDailyData, setDailyData } from "@/lib/storage";
import { emitChanged } from "@/lib/bus";
import { readTodayIntention, saveJSON, KEY_INTENT } from "@/lib/dailyFlow";
import { z } from "zod";

// Unified task data structure
export interface UnifiedTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UnifiedTaskData {
  tasks: UnifiedTask[];
  selectedAnimal: string;
  reflections: string[];
  roundsCompleted: number;
  totalTasksCompleted: number;
  lastUpdated: string;
}

// Schema for validation
const UnifiedTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

const UnifiedTaskDataSchema = z.object({
  tasks: z.array(UnifiedTaskSchema),
  selectedAnimal: z.string(),
  reflections: z.array(z.string()),
  roundsCompleted: z.number(),
  totalTasksCompleted: z.number(),
  lastUpdated: z.string(),
});

// Storage key
const UNIFIED_TASKS_KEY = "fm_unified_tasks_v1";

// Default data
const getDefaultTaskData = (): UnifiedTaskData => ({
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

// Get unified task data
export const getUnifiedTaskData = (): UnifiedTaskData => {
  const data = getDailyData(UNIFIED_TASKS_KEY, getDefaultTaskData());
  
  // Validate and migrate if needed
  try {
    return UnifiedTaskDataSchema.parse(data);
  } catch (error) {
    console.warn("Invalid task data structure, using default:", error);
    return getDefaultTaskData();
  }
};

// Save unified task data
export const saveUnifiedTaskData = (data: UnifiedTaskData) => {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  
  setDailyData(UNIFIED_TASKS_KEY, updatedData);
  emitChanged([UNIFIED_TASKS_KEY]);
  
  // Emit legacy events for backward compatibility
  window.dispatchEvent(new CustomEvent('tasksUpdated'));
  window.dispatchEvent(new Event('storage'));
};

// Initialize tasks from intention (Big Three)
export const initializeTasksFromIntention = () => {
  const intention = readTodayIntention();
  const currentData = getUnifiedTaskData();
  
  if (intention?.top3 && intention.top3.length > 0 && currentData.tasks.length === 0) {
    const tasks: UnifiedTask[] = intention.top3
      .filter(task => task.trim())
      .map(task => ({
        id: generateTaskId(),
        title: task.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      }));
    
    const updatedData = {
      ...currentData,
      tasks,
    };
    
    saveUnifiedTaskData(updatedData);
    return updatedData;
  }
  
  return currentData;
};

// Add a new task
export const addTask = (title: string): UnifiedTask => {
  const data = getUnifiedTaskData();
  const newTask: UnifiedTask = {
    id: generateTaskId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  
  const updatedData = {
    ...data,
    tasks: [...data.tasks, newTask],
  };
  
  saveUnifiedTaskData(updatedData);
  return newTask;
};

// Update a task
export const updateTask = (taskId: string, updates: Partial<UnifiedTask>) => {
  const data = getUnifiedTaskData();
  const taskIndex = data.tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    console.warn(`Task with id ${taskId} not found`);
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
  
  saveUnifiedTaskData(updatedData);
};

// Delete a task
export const deleteTask = (taskId: string) => {
  const data = getUnifiedTaskData();
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    console.warn(`Task with id ${taskId} not found`);
    return;
  }
  
  const updatedTasks = data.tasks.filter(t => t.id !== taskId);
  
  // Update completion stats
  let totalTasksCompleted = data.totalTasksCompleted;
  if (task.completed) {
    totalTasksCompleted = Math.max(0, totalTasksCompleted - 1);
  }
  
  const updatedData = {
    ...data,
    tasks: updatedTasks,
    totalTasksCompleted,
  };
  
  saveUnifiedTaskData(updatedData);
};

// Update animal selection
export const updateSelectedAnimal = (animalId: string) => {
  const data = getUnifiedTaskData();
  const updatedData = {
    ...data,
    selectedAnimal: animalId,
  };
  
  saveUnifiedTaskData(updatedData);
};

// Update reflections
export const updateReflections = (reflections: string[]) => {
  const data = getUnifiedTaskData();
  const updatedData = {
    ...data,
    reflections,
  };
  
  saveUnifiedTaskData(updatedData);
};

// Reset today's tasks (soft reset)
export const resetTodaysTasks = () => {
  const data = getUnifiedTaskData();
  const updatedData = {
    ...getDefaultTaskData(),
    selectedAnimal: data.selectedAnimal, // Keep the selected animal
    roundsCompleted: data.roundsCompleted + (data.tasks.length > 0 ? 1 : 0),
    totalTasksCompleted: data.totalTasksCompleted,
  };
  
  // Clear the daily intention so tasks don't auto-repopulate
  localStorage.removeItem(KEY_INTENT);
  
  saveUnifiedTaskData(updatedData);
};

// Get completion stats
export const getCompletionStats = () => {
  const data = getUnifiedTaskData();
  const completedCount = data.tasks.filter(task => task.completed).length;
  const totalCount = data.tasks.length;
  
  return {
    completedCount,
    totalCount,
    percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    allCompleted: totalCount > 0 && completedCount === totalCount,
  };
};

// Get big three tasks (first 3 tasks)
export const getBigThreeTasks = (): [UnifiedTask | null, UnifiedTask | null, UnifiedTask | null] => {
  const data = getUnifiedTaskData();
  return [
    data.tasks[0] || null,
    data.tasks[1] || null,
    data.tasks[2] || null,
  ];
};

// Set big three tasks (ensures exactly 3 tasks exist)
export const setBigThreeTasks = (task1: string, task2: string, task3: string) => {
  const data = getUnifiedTaskData();
  const tasks: UnifiedTask[] = [];
  
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
  
  // Keep any additional tasks beyond the first 3
  const additionalTasks = data.tasks.slice(3);
  
  const updatedData = {
    ...data,
    tasks: [...tasks, ...additionalTasks],
  };
  
  saveUnifiedTaskData(updatedData);
};
