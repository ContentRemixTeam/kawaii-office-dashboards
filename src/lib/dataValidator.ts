/**
 * Data validation utilities for ensuring data integrity across the application
 */

import { errorHandler } from './errorHandler';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
};

class DataValidator {
  /**
   * Validate task data structure
   */
  validateTask(task: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    if (!task || typeof task !== 'object') {
      result.isValid = false;
      result.errors.push('Task must be an object');
      return result;
    }

    // Required fields
    if (!task.id || typeof task.id !== 'string') {
      result.isValid = false;
      result.errors.push('Task must have a valid string ID');
    }

    if (!task.text || typeof task.text !== 'string') {
      result.isValid = false;
      result.errors.push('Task must have valid text');
    }

    if (typeof task.completed !== 'boolean') {
      result.isValid = false;
      result.errors.push('Task completed status must be boolean');
    }

    // Optional fields validation
    if (task.createdAt && !(task.createdAt instanceof Date) && !this.isValidDateString(task.createdAt)) {
      result.warnings.push('Task createdAt should be a valid date');
    }

    if (task.completedAt && !(task.completedAt instanceof Date) && !this.isValidDateString(task.completedAt)) {
      result.warnings.push('Task completedAt should be a valid date');
    }

    if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
      result.warnings.push('Task priority should be low, medium, or high');
    }

    // Sanitize data
    result.sanitizedData = {
      id: task.id,
      text: typeof task.text === 'string' ? task.text.trim() : '',
      completed: Boolean(task.completed),
      createdAt: this.sanitizeDate(task.createdAt),
      completedAt: this.sanitizeDate(task.completedAt),
      priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
      category: typeof task.category === 'string' ? task.category.trim() : 'general'
    };

    return result;
  }

  /**
   * Validate habit data structure
   */
  validateHabit(habit: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    if (!habit || typeof habit !== 'object') {
      result.isValid = false;
      result.errors.push('Habit must be an object');
      return result;
    }

    // Required fields
    if (!habit.id || typeof habit.id !== 'string') {
      result.isValid = false;
      result.errors.push('Habit must have a valid string ID');
    }

    if (!habit.name || typeof habit.name !== 'string') {
      result.isValid = false;
      result.errors.push('Habit must have a valid name');
    }

    if (typeof habit.streak !== 'number' || habit.streak < 0) {
      result.isValid = false;
      result.errors.push('Habit streak must be a non-negative number');
    }

    // Sanitize data
    result.sanitizedData = {
      id: habit.id,
      name: typeof habit.name === 'string' ? habit.name.trim() : '',
      streak: Math.max(0, Number(habit.streak) || 0),
      lastCompleted: this.sanitizeDate(habit.lastCompleted),
      createdAt: this.sanitizeDate(habit.createdAt),
      targetFrequency: Math.max(1, Number(habit.targetFrequency) || 1),
      category: typeof habit.category === 'string' ? habit.category.trim() : 'general'
    };

    return result;
  }

  /**
   * Validate focus timer configuration
   */
  validateFocusConfig(config: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Focus config must be an object');
      return result;
    }

    // Validate timing values
    const timingFields = ['focusMin', 'shortMin', 'longMin', 'longEvery'];
    timingFields.forEach(field => {
      if (config[field] !== undefined) {
        const value = Number(config[field]);
        if (isNaN(value) || value < 1 || value > 120) {
          result.warnings.push(`${field} should be between 1 and 120 minutes`);
        }
      }
    });

    // Validate workflow type
    if (config.workflow && !['classic', 'deep', 'sprint', 'custom'].includes(config.workflow)) {
      result.warnings.push('Invalid workflow type');
    }

    // Validate sound type
    if (config.sound && !['chime', 'bell', 'off'].includes(config.sound)) {
      result.warnings.push('Invalid sound type');
    }

    // Sanitize data
    result.sanitizedData = {
      focusMin: this.clamp(Number(config.focusMin) || 25, 1, 120),
      shortMin: this.clamp(Number(config.shortMin) || 5, 1, 120),
      longMin: this.clamp(Number(config.longMin) || 15, 1, 120),
      longEvery: this.clamp(Number(config.longEvery) || 4, 2, 10),
      workflow: ['classic', 'deep', 'sprint', 'custom'].includes(config.workflow) ? config.workflow : 'classic',
      sound: ['chime', 'bell', 'off'].includes(config.sound) ? config.sound : 'chime',
      tickSound: Boolean(config.tickSound),
      notify: Boolean(config.notify),
      autoStartBreak: Boolean(config.autoStartBreak),
      autoStartFocus: Boolean(config.autoStartFocus)
    };

    return result;
  }

  /**
   * Validate localStorage data structure
   */
  validateStorageData(key: string, data: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    try {
      // Check data size (5MB localStorage limit)
      const serialized = JSON.stringify(data);
      const sizeInMB = serialized.length / (1024 * 1024);
      
      if (sizeInMB > 4.5) { // Leave some buffer
        result.isValid = false;
        result.errors.push(`Data too large for localStorage (${sizeInMB.toFixed(2)}MB)`);
      } else if (sizeInMB > 2) {
        result.warnings.push(`Large data size (${sizeInMB.toFixed(2)}MB) - consider optimization`);
      }

      // Check for circular references
      this.checkCircularReferences(data);

      // Validate specific data types based on key patterns
      if (key.includes('task')) {
        return this.validateTaskCollection(data);
      } else if (key.includes('habit')) {
        return this.validateHabitCollection(data);
      } else if (key.includes('focus') || key.includes('timer')) {
        return this.validateFocusConfig(data);
      }

      result.sanitizedData = data;
      return result;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Data validation error: ${(error as Error).message}`);
      return result;
    }
  }

  /**
   * Validate collection of tasks
   */
  private validateTaskCollection(tasks: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [], sanitizedData: [] };

    if (!Array.isArray(tasks)) {
      result.isValid = false;
      result.errors.push('Task collection must be an array');
      return result;
    }

    const validTasks: any[] = [];
    tasks.forEach((task, index) => {
      const taskValidation = this.validateTask(task);
      if (taskValidation.isValid && taskValidation.sanitizedData) {
        validTasks.push(taskValidation.sanitizedData);
      } else {
        result.warnings.push(`Invalid task at index ${index}: ${taskValidation.errors.join(', ')}`);
      }
    });

    result.sanitizedData = validTasks;
    return result;
  }

  /**
   * Validate collection of habits
   */
  private validateHabitCollection(habits: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [], sanitizedData: [] };

    if (!Array.isArray(habits)) {
      result.isValid = false;
      result.errors.push('Habit collection must be an array');
      return result;
    }

    const validHabits: any[] = [];
    habits.forEach((habit, index) => {
      const habitValidation = this.validateHabit(habit);
      if (habitValidation.isValid && habitValidation.sanitizedData) {
        validHabits.push(habitValidation.sanitizedData);
      } else {
        result.warnings.push(`Invalid habit at index ${index}: ${habitValidation.errors.join(', ')}`);
      }
    });

    result.sanitizedData = validHabits;
    return result;
  }

  /**
   * Check for circular references in data
   */
  private checkCircularReferences(obj: any, seen = new WeakSet()): void {
    if (obj !== null && typeof obj === 'object') {
      if (seen.has(obj)) {
        throw new Error('Circular reference detected in data');
      }
      seen.add(obj);
      for (const key in obj) {
        this.checkCircularReferences(obj[key], seen);
      }
      seen.delete(obj);
    }
  }

  /**
   * Utility: Check if string is valid date
   */
  private isValidDateString(dateString: any): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Utility: Sanitize date value
   */
  private sanitizeDate(date: any): string | null {
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'string' && this.isValidDateString(date)) {
      return new Date(date).toISOString();
    }
    return null;
  }

  /**
   * Utility: Clamp number between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Validate and sanitize any data before storage
   */
  validateAndSanitize(key: string, data: any): { isValid: boolean; sanitizedData?: any; errors: string[] } {
    try {
      const validation = this.validateStorageData(key, data);
      
      if (validation.errors.length > 0) {
        errorHandler.logError(
          new Error(`Data validation failed for ${key}: ${validation.errors.join(', ')}`),
          'medium',
          'validation',
          { key, errors: validation.errors }
        );
      }

      if (validation.warnings.length > 0) {
        errorHandler.logError(
          new Error(`Data validation warnings for ${key}: ${validation.warnings.join(', ')}`),
          'low',
          'validation',
          { key, warnings: validation.warnings }
        );
      }

      return {
        isValid: validation.isValid,
        sanitizedData: validation.sanitizedData,
        errors: validation.errors
      };
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'validation',
        { key, operation: 'validateAndSanitize' }
      );
      
      return {
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();
export default dataValidator;