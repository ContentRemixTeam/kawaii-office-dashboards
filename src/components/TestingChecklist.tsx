import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, RotateCcw, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface TestItem {
  id: string;
  name: string;
  description: string;
  instructions: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TestResult {
  status: 'untested' | 'pass' | 'fail';
  notes: string;
  timestamp?: Date;
}

const TEST_CATEGORIES = [
  {
    name: 'Navigation & Layout',
    emoji: '🧭',
    items: [
      {
        id: 'nav-1',
        name: 'Home Page Load',
        description: 'Dashboard loads correctly with all sections',
        instructions: 'Navigate to / - verify dashboard loads, pet display shows, no console errors',
        category: 'Navigation & Layout',
        priority: 'high' as const
      },
      {
        id: 'nav-2', 
        name: 'Sidebar Navigation',
        description: 'All tool navigation links work correctly',
        instructions: 'Click each sidebar link - verify page loads, URL updates, no broken routes',
        category: 'Navigation & Layout',
        priority: 'high' as const
      },
      {
        id: 'nav-3',
        name: 'Responsive Design',
        description: 'App works on mobile and desktop',
        instructions: 'Test on mobile viewport - verify sidebar collapses, content responsive, touch targets adequate',
        category: 'Navigation & Layout', 
        priority: 'medium' as const
      },
      {
        id: 'nav-4',
        name: 'Back Navigation',
        description: 'Back to Office buttons work from tool pages',
        instructions: 'Navigate to any tool page, click "Back to Office" - verify returns to dashboard',
        category: 'Navigation & Layout',
        priority: 'medium' as const
      }
    ]
  },
  {
    name: 'Daily Productivity Tools',
    emoji: '🌱',
    items: [
      {
        id: 'daily-1',
        name: 'Big Three Tasks',
        description: 'Task creation, editing, and completion',
        instructions: 'Add 3 tasks, mark complete, verify pet growth animation, check localStorage persistence',
        category: 'Daily Productivity Tools',
        priority: 'high' as const
      },
      {
        id: 'daily-2',
        name: 'Pet Companion System',
        description: 'Pet selection and growth stages',
        instructions: 'Select different animals, complete tasks, verify growth stages progress correctly',
        category: 'Daily Productivity Tools', 
        priority: 'high' as const
      },
      {
        id: 'daily-3',
        name: 'Daily Intention Modal',
        description: 'Morning intention setting workflow',
        instructions: 'Clear localStorage, reload page, verify intention modal appears, set intention',
        category: 'Daily Productivity Tools',
        priority: 'medium' as const
      },
      {
        id: 'daily-4',
        name: 'Energy Word',
        description: 'Daily energy word selection and display',
        instructions: 'Navigate to Energy tool, select word, verify saves and displays on dashboard',
        category: 'Daily Productivity Tools',
        priority: 'medium' as const
      },
      {
        id: 'daily-5',
        name: 'Task Tracking',
        description: 'Task management and completion tracking',
        instructions: 'Add tasks, mark complete, verify persistence, check task counter',
        category: 'Daily Productivity Tools',
        priority: 'medium' as const
      }
    ]
  },
  {
    items: [
      {
        id: 'focus-1',
        name: 'Pomodoro Timer',
        description: 'Timer starts, runs, and completes with notifications',
        instructions: 'Start 1-minute test session, verify countdown, completion modal, celebration animation',
        category: 'Focus & Time Management',
        priority: 'high' as const
      },
      {
        id: 'focus-2',
        name: 'Timer Controls',
        description: 'Play, pause, stop, and reset functionality',
        instructions: 'Test all timer controls, verify state persistence, check audio notifications',
        category: 'Focus & Time Management',
        priority: 'high' as const
      },
      {
        id: 'focus-3',
        name: 'Beat the Clock',
        description: 'Quick productivity challenges',
        instructions: 'Navigate to Beat Clock tool, start challenges, verify timers and completion tracking',
        category: 'Focus & Time Management',
        priority: 'medium' as const
      },
      {
        id: 'focus-4',
        name: 'Session History',
        description: 'Focus session tracking and statistics',
        instructions: 'Complete multiple sessions, verify history saves, check statistics display',
        category: 'Focus & Time Management', 
        priority: 'low' as const
      }
    ]
  },
  {
    name: 'Media & YouTube Integration',
    emoji: '📺',
    items: [
      {
        id: 'media-1',
        name: 'YouTube Video Loading',
        description: 'Videos load reliably on first try',
        instructions: 'Test Break Room videos, verify load without retry popup, check console for errors',
        category: 'Media & YouTube Integration',
        priority: 'high' as const
      },
      {
        id: 'media-2',
        name: 'Background Videos',
        description: 'Office background videos play correctly',
        instructions: 'Test different office backgrounds, verify video plays, no loading errors',
        category: 'Media & YouTube Integration',
        priority: 'medium' as const
      },
      {
        id: 'media-3',
        name: 'Ambient Audio',
        description: 'Soundscape audio plays and controls work',
        instructions: 'Test Sounds tool, play different tracks, verify volume controls and looping',
        category: 'Media & YouTube Integration',
        priority: 'medium' as const
      },
      {
        id: 'media-4',
        name: 'Custom YouTube URLs',
        description: 'User can add custom YouTube videos',
        instructions: 'Add custom YouTube URL in Break Room, verify video loads and plays correctly',
        category: 'Media & YouTube Integration',
        priority: 'medium' as const
      }
    ]
  },
  {
    name: 'Positivity & Wellness',
    emoji: '✨',
    items: [
      {
        id: 'wellness-1',
        name: 'Vision Board',
        description: 'Vision creation and display functionality',
        instructions: 'Create vision board, add images/text, verify saves and displays on dashboard',
        category: 'Positivity & Wellness',
        priority: 'medium' as const
      },
      {
        id: 'wellness-2',
        name: 'Positivity Cabinet',
        description: 'Positive content storage and retrieval',
        instructions: 'Add items to cabinet, organize categories, verify persistence and display',
        category: 'Positivity & Wellness',
        priority: 'medium' as const
      },
      {
        id: 'wellness-3',
        name: 'Celebration System',
        description: 'Task completion celebrations and animations',
        instructions: 'Complete tasks, verify confetti, GIF animations, celebration modals appear',
        category: 'Positivity & Wellness',
        priority: 'medium' as const
      },
      {
        id: 'wellness-4',
        name: 'Trophy System',
        description: 'Achievement tracking and trophy display',
        instructions: 'Complete various actions, verify trophies unlock, check trophy case display',
        category: 'Positivity & Wellness',
        priority: 'low' as const
      }
    ]
  },
  {
    name: 'Data & Storage',
    emoji: '💾',
    items: [
      {
        id: 'data-1',
        name: 'LocalStorage Persistence',
        description: 'Data saves correctly across sessions',
        instructions: 'Add data, refresh page, verify data persists, test multiple browser tabs',
        category: 'Data & Storage',
        priority: 'high' as const
      },
      {
        id: 'data-2',
        name: 'Cross-Tab Synchronization',
        description: 'Changes sync between browser tabs',
        instructions: 'Open app in two tabs, make changes in one, verify updates in other tab',
        category: 'Data & Storage',
        priority: 'medium' as const
      },
      {
        id: 'data-3',
        name: 'Data Export/Import',
        description: 'User can backup and restore data',
        instructions: 'Export data, clear storage, import data, verify all content restored',
        category: 'Data & Storage',
        priority: 'low' as const
      },
      {
        id: 'data-4',
        name: 'Error Recovery',
        description: 'App handles corrupted or missing data gracefully',
        instructions: 'Manually corrupt localStorage, reload app, verify graceful fallback to defaults',
        category: 'Data & Storage',
        priority: 'medium' as const
      }
    ]
  },
  {
    name: 'UI & Theming',
    emoji: '🎨',
    items: [
      {
        id: 'ui-1',
        name: 'Theme Switching',
        description: 'Light/dark mode toggle works correctly',
        instructions: 'Switch between themes, verify colors update, check persistence across refresh',
        category: 'UI & Theming',
        priority: 'medium' as const
      },
      {
        id: 'ui-2',
        name: 'Interactive Elements',
        description: 'Buttons, modals, and forms work correctly',
        instructions: 'Test all interactive elements, verify hover states, focus indicators, click responses',
        category: 'UI & Theming',
        priority: 'high' as const
      },
      {
        id: 'ui-3',
        name: 'Error States',
        description: 'Proper error messages and fallback UI',
        instructions: 'Trigger error conditions, verify user-friendly error messages appear',
        category: 'UI & Theming',
        priority: 'medium' as const
      },
      {
        id: 'ui-4',
        name: 'Loading States',
        description: 'Loading indicators appear for async operations',
        instructions: 'Monitor loading states during data operations, verify spinners/skeletons appear',
        category: 'UI & Theming',
        priority: 'low' as const
      }
    ]
  }
];

const ALL_TEST_ITEMS = TEST_CATEGORIES.flatMap(category => category.items);

export default function TestingChecklist() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [consoleChecked, setConsoleChecked] = useState(false);

  const updateTestResult = (itemId: string, status: TestResult['status'], notes: string = '') => {
    setTestResults(prev => ({
      ...prev,
      [itemId]: {
        status,
        notes,
        timestamp: new Date()
      }
    }));
  };

  const updateNotes = (itemId: string, notes: string) => {
    setTestResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const resetAllTests = () => {
    setTestResults({});
    setConsoleChecked(false);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      consoleChecked,
      testResults: Object.entries(testResults).map(([itemId, result]) => {
        const item = ALL_TEST_ITEMS.find(i => i.id === itemId);
        return {
          itemId,
          itemName: item?.name,
          category: item?.category,
          status: result.status,
          notes: result.notes,
          timestamp: result.timestamp
        };
      })
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-testing-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgress = () => {
    const totalItems = ALL_TEST_ITEMS.length;
    const testedItems = Object.values(testResults).filter(r => r.status !== 'untested').length;
    return Math.round((testedItems / totalItems) * 100);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getCategorySummary = (categoryName: string) => {
    const categoryItems = TEST_CATEGORIES.find(c => c.name === categoryName)?.items || [];
    const passed = categoryItems.filter(item => testResults[item.id]?.status === 'pass').length;
    const failed = categoryItems.filter(item => testResults[item.id]?.status === 'fail').length;
    const untested = categoryItems.filter(item => !testResults[item.id] || testResults[item.id].status === 'untested').length;
    
    return { passed, failed, untested, total: categoryItems.length };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 App Feature Testing Checklist
          </CardTitle>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{getProgress()}% Complete</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={resetAllTests} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Console Check Reminder */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Browser Console Check</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Remember to check the browser console (F12 → Console tab) for JavaScript errors during testing.
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="console-check"
                  checked={consoleChecked}
                  onCheckedChange={(checked) => setConsoleChecked(checked as boolean)}
                />
                <label htmlFor="console-check" className="text-sm font-medium">
                  I have checked the console for errors
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      {TEST_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories[category.name];
        const summary = getCategorySummary(category.name);
        
        return (
          <Card key={category.name}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.name)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-lg">{category.emoji}</span>
                      {category.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      {summary.passed > 0 && <Badge variant="secondary" className="bg-green-100 text-green-800">{summary.passed} pass</Badge>}
                      {summary.failed > 0 && <Badge variant="secondary" className="bg-red-100 text-red-800">{summary.failed} fail</Badge>}
                      {summary.untested > 0 && <Badge variant="outline">{summary.untested} untested</Badge>}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {category.items.map((item) => {
                    const result = testResults[item.id];
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(result?.status || 'untested')}
                              <h4 className="font-medium">{item.name}</h4>
                              <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                              <strong>Test Instructions:</strong> {item.instructions}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={result?.status === 'pass' ? 'default' : 'outline'}
                            onClick={() => updateTestResult(item.id, 'pass', result?.notes || '')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Pass
                          </Button>
                          <Button
                            size="sm"
                            variant={result?.status === 'fail' ? 'destructive' : 'outline'}
                            onClick={() => updateTestResult(item.id, 'fail', result?.notes || '')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Fail
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Add notes about this test (issues found, observations, etc.)"
                          value={result?.notes || ''}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}