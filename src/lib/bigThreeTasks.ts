import { getDailyData, setDailyData } from "@/lib/storage";
import { emitChanged } from "@/lib/bus";
import { z } from "zod";

// Big Three task data structure - separate from pet tasks
export interface BigThreeTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface BigThreeData {
  tasks: BigThreeTask[];
  streak: number;
  lastCompletedDate: string;
  lastUpdated: string;
}

// Schema for validation
const BigThreeTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

const BigThreeDataSchema = z.object({
  tasks: z.array(BigThreeTaskSchema),
  streak: z.number(),
  lastCompletedDate: z.string(),
  lastUpdated: z.string(),
});

// Storage key
const BIG_THREE_KEY = "fm_big_three_v1";

// Default data
const getDefaultBigThreeData = (): BigThreeData => ({
  tasks: [],
  streak: 0,
  lastCompletedDate: "",
  lastUpdated: new Date().toISOString(),
});

// Generate unique ID
const generateTaskId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get Big Three data
export const getBigThreeData = (): BigThreeData => {
  const data = getDailyData(BIG_THREE_KEY, getDefaultBigThreeData());
  
  // Validate and migrate if needed
  try {
    return BigThreeDataSchema.parse(data);
  } catch (error) {
    console.warn("Invalid Big Three data structure, using default:", error);
    return getDefaultBigThreeData();
  }
};

// Save Big Three data
export const saveBigThreeData = (data: BigThreeData) => {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  
  setDailyData(BIG_THREE_KEY, updatedData);
  emitChanged([BIG_THREE_KEY]);
  
  // Emit legacy events for backward compatibility
  window.dispatchEvent(new CustomEvent('bigThreeUpdated'));
  window.dispatchEvent(new Event('storage'));
};

// Get Big Three tasks (exactly 3)
export const getBigThreeTasks = (): [BigThreeTask | null, BigThreeTask | null, BigThreeTask | null] => {
  const data = getBigThreeData();
  return [
    data.tasks[0] || null,
    data.tasks[1] || null,
    data.tasks[2] || null,
  ];
};

// Set Big Three tasks (ensures exactly 3 tasks exist)
export const setBigThreeTasks = (task1: string, task2: string, task3: string) => {
  const data = getBigThreeData();
  const tasks: BigThreeTask[] = [];
  
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
  
  saveBigThreeData(updatedData);
};

// Update a Big Three task
export const updateBigThreeTask = (taskId: string, updates: Partial<BigThreeTask>) => {
  const data = getBigThreeData();
  const taskIndex = data.tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    console.warn(`Big Three task with id ${taskId} not found`);
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
  
  const updatedData = {
    ...data,
    tasks: updatedTasks,
  };
  
  saveBigThreeData(updatedData);
};

// Get Big Three completion stats
export const getBigThreeStats = () => {
  const data = getBigThreeData();
  const completedCount = data.tasks.filter(task => task.completed).length;
  const totalCount = data.tasks.length;
  
  return {
    completedCount,
    totalCount,
    percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    allCompleted: totalCount > 0 && completedCount === totalCount,
  };
};