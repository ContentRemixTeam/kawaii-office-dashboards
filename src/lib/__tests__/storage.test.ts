import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { storage } from '../storage';

const TestSchema = z.object({
  name: z.string(),
  count: z.number(),
});

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get and set items with schema validation', () => {
    const testData = { name: 'test', count: 5 };
    
    storage.setItem('test-key', testData);
    const result = storage.getItem('test-key', TestSchema, { name: '', count: 0 });
    
    expect(result).toEqual(testData);
  });

  it('should return fallback for invalid data', () => {
    localStorage.setItem('test-key', 'invalid-json');
    
    const result = storage.getItem('test-key', TestSchema, { name: 'fallback', count: 0 });
    
    expect(result).toEqual({ name: 'fallback', count: 0 });
  });

  it('should handle daily keys correctly', () => {
    const testDate = '2024-01-01';
    const dailyKey = storage.dailyKey('test-base', testDate);
    
    expect(dailyKey).toBe('test-base:2024-01-01');
  });
});