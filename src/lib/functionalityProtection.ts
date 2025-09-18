/**
 * CRITICAL FUNCTIONALITY PROTECTION SYSTEM
 * This file contains utilities and patterns to prevent feature regression
 * and ensure core functionality always works.
 */

import { toast } from '@/hooks/use-toast';

// Feature Testing Registry
export const CRITICAL_FEATURES = {
  INTENTION_BUTTON: 'Daily Intention Button',
  DEBRIEF_BUTTON: 'Daily Debrief Button',
  TASK_CREATION: 'Task Creation',
  TASK_COMPLETION: 'Task Completion',
  PET_INTERACTION: 'Pet Growth and Interaction',
  TIMER_FUNCTIONALITY: 'Focus Timer',
  NAVIGATION: 'Page Navigation',
  TROPHY_SYSTEM: 'Trophy and Celebration System',
  SETTINGS: 'Settings and Preferences',
  DATA_PERSISTENCE: 'Data Saving and Loading'
} as const;

// Safe Function Execution Wrapper
export const safeExecute = (
  action: () => void, 
  featureName: string,
  fallbackAction?: () => void
) => {
  try {
    console.log(`[FUNC_TEST] ${featureName} starting...`);
    action();
    console.log(`[FUNC_TEST] ${featureName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`[FUNC_TEST] ${featureName} failed:`, error);
    
    // Try fallback if available
    if (fallbackAction) {
      try {
        console.log(`[FUNC_TEST] ${featureName} attempting fallback...`);
        fallbackAction();
        console.log(`[FUNC_TEST] ${featureName} fallback succeeded`);
        return true;
      } catch (fallbackError) {
        console.error(`[FUNC_TEST] ${featureName} fallback failed:`, fallbackError);
      }
    }
    
    // Show user-friendly error
    toast({
      title: "Feature temporarily unavailable",
      description: `${featureName} encountered an error. Please try again.`,
      variant: "destructive",
    });
    
    return false;
  }
};

// Component Health Check
export const runComponentHealthCheck = () => {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>
  };

  // Check critical DOM elements exist
  const criticalElements = [
    { selector: '[data-testid="intention-button"]', feature: 'Intention Button' },
    { selector: '[data-testid="debrief-button"]', feature: 'Debrief Button' },
    { selector: '[data-testid="task-input"]', feature: 'Task Input' },
    { selector: '[data-testid="timer-display"]', feature: 'Timer Display' }
  ];

  criticalElements.forEach(({ selector, feature }) => {
    const element = document.querySelector(selector) as HTMLElement;
    results.checks[feature] = {
      exists: !!element,
      clickable: element ? !(element as any).disabled : false
    };
  });

  // Check localStorage functionality
  try {
    const testKey = 'health_check_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    results.checks['LocalStorage'] = { working: true };
  } catch (error: any) {
    results.checks['LocalStorage'] = { working: false, error: error.message };
  }

  console.log('[HEALTH_CHECK] Results:', results);
  return results;
};

// Feature Flag System
export const FeatureFlags = {
  isEnabled: (feature: string): boolean => {
    try {
      const flags = JSON.parse(localStorage.getItem('feature_flags') || '{}');
      return flags[feature] !== false; // Default to enabled
    } catch {
      return true; // Default to enabled if can't read flags
    }
  },
  
  disable: (feature: string) => {
    try {
      const flags = JSON.parse(localStorage.getItem('feature_flags') || '{}');
      flags[feature] = false;
      localStorage.setItem('feature_flags', JSON.stringify(flags));
      console.log(`[FEATURE_FLAGS] Disabled: ${feature}`);
    } catch (error) {
      console.error(`[FEATURE_FLAGS] Failed to disable ${feature}:`, error);
    }
  },
  
  enable: (feature: string) => {
    try {
      const flags = JSON.parse(localStorage.getItem('feature_flags') || '{}');
      flags[feature] = true;
      localStorage.setItem('feature_flags', JSON.stringify(flags));
      console.log(`[FEATURE_FLAGS] Enabled: ${feature}`);
    } catch (error) {
      console.error(`[FEATURE_FLAGS] Failed to enable ${feature}:`, error);
    }
  }
};

// Testing Checklist Runner
export const runCriticalFeatureTests = () => {
  console.log('[TESTING] Running critical feature tests...');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    passed: 0,
    failed: 0,
    tests: {} as Record<string, string>
  };

  // Test intention button
  try {
    const intentionBtn = document.querySelector('[data-testid="intention-button"]') as HTMLButtonElement;
    if (intentionBtn && !intentionBtn.disabled) {
      testResults.tests['intention_button'] = 'PASS';
      testResults.passed++;
    } else {
      testResults.tests['intention_button'] = 'FAIL - Button not found or disabled';
      testResults.failed++;
    }
  } catch (error: any) {
    testResults.tests['intention_button'] = `FAIL - ${error.message}`;
    testResults.failed++;
  }

  // Test debrief button
  try {
    const debriefBtn = document.querySelector('[data-testid="debrief-button"]') as HTMLButtonElement;
    if (debriefBtn && !debriefBtn.disabled) {
      testResults.tests['debrief_button'] = 'PASS';
      testResults.passed++;
    } else {
      testResults.tests['debrief_button'] = 'FAIL - Button not found or disabled';
      testResults.failed++;
    }
  } catch (error: any) {
    testResults.tests['debrief_button'] = `FAIL - ${error.message}`;
    testResults.failed++;
  }

  // Test localStorage
  try {
    localStorage.setItem('test_key', 'test_value');
    const retrieved = localStorage.getItem('test_key');
    localStorage.removeItem('test_key');
    
    if (retrieved === 'test_value') {
      testResults.tests['localStorage'] = 'PASS';
      testResults.passed++;
    } else {
      testResults.tests['localStorage'] = 'FAIL - Data not persisted correctly';
      testResults.failed++;
    }
  } catch (error: any) {
    testResults.tests['localStorage'] = `FAIL - ${error.message}`;
    testResults.failed++;
  }

  console.log('[TESTING] Results:', testResults);
  
  // Store results for monitoring
  try {
    localStorage.setItem('last_feature_test_results', JSON.stringify(testResults));
  } catch (error) {
    console.error('[TESTING] Failed to store test results:', error);
  }

  return testResults;
};

// Auto-run health checks on app startup
if (typeof window !== 'undefined') {
  // Run health check after page loads
  setTimeout(() => {
    runComponentHealthCheck();
    runCriticalFeatureTests();
  }, 2000);
}

export default {
  CRITICAL_FEATURES,
  safeExecute,
  runComponentHealthCheck,
  FeatureFlags,
  runCriticalFeatureTests
};