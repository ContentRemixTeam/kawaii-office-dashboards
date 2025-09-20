import { Calendar, CheckCircle, Coins, Coffee, Focus, Zap, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { safeStorage } from "@/lib/safeStorage";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onChanged } from "@/lib/bus";
import { getBigThreeTasks, setBigThreeTasks, updateBigThreeTask, getBigThreeStats } from "@/lib/bigThreeTasks";
import { awardActivityCurrency, EARNING_RATES } from "@/lib/unifiedCurrency";
import { toast } from "@/hooks/use-toast";
import useDailyFlow from "@/hooks/useDailyFlow";
import { saveDailyWin } from "@/lib/dailyWins";
import { addEarnedAnimal } from "@/lib/topbarState";

// TypeScript interfaces for task data structure
interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

export function BigThreeCard() {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });
  const [bigThreeTasks, setBigThreeTasksState] = useState<[any, any, any]>([null, null, null]);
  const { setShowIntention } = useDailyFlow();

  useEffect(() => {
    // Load initial dashboard data using safeStorage
    const defaultDashData: DashboardData = { streak: 0, lastCompletedDate: "" };
    const dashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
    setStreakData(dashData || defaultDashData);

    // Load tasks
    const tasks = getBigThreeTasks();
    setBigThreeTasksState(tasks);

    // Subscribe to storage changes using the existing bus system
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_dashboard_v1")) {
        const newDashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
        setStreakData(newDashData || defaultDashData);
      }
      if (keys.includes("fm_big_three_v1")) {
        const tasks = getBigThreeTasks();
        setBigThreeTasksState(tasks);
      }
    });

    return unsubscribe;
  }, []);

  const handleTaskChange = (index: number, value: string) => {
    const tasks = getBigThreeTasks();
    const newTitles = tasks.map((task, i) => 
      i === index ? value : (task?.title || "")
    );
    setBigThreeTasks(newTitles[0], newTitles[1], newTitles[2]);
  };

  const toggleTaskCompleted = (index: number) => {
    const task = bigThreeTasks[index];
    if (!task) return;
    
    const wasCompleted = task.completed;
    const nowCompleted = !wasCompleted;
    
    updateBigThreeTask(task.id, { completed: nowCompleted });
    
    // Award bonus coins when completing a Big Three task (not when uncompleting)
    if (nowCompleted && !wasCompleted) {
      // Award Big Three bonus coins
      const currencyData = awardActivityCurrency('BIG_THREE_BONUS', `bigThree-${task.title}`);
      
      // Save as daily win with task details
      saveDailyWin({
        taskTitle: task.title,
        taskIndex: index,
        celebrationNote: `Completed Big Three task: ${task.title}`,
        completedAt: new Date().toISOString()
      });
      
      // Show celebration toast with coin reward
      toast({
        title: "🎉 Big Three Complete!",
        description: `+${EARNING_RATES.BIG_THREE_BONUS.coins} bonus coins earned! 🪙`,
        duration: 4000,
      });
    
      // Add a random earned animal on Big Three completion
      addEarnedAnimal('bigthree-reward', '🌟');
    }
  };

  const stats = getBigThreeStats();
  const hasAnyTasks = bigThreeTasks.some(task => task?.title?.trim());

  return (
    <div 
      className="p-6 space-y-6 rounded-2xl"
      style={{ 
        backgroundColor: '#FAFAFA',
        border: '1px solid #E5E7EB'
      }}
    >
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: '#FFD700' }}>⭐</span>
            <h2 
              className="text-2xl font-bold"
              style={{ color: '#2E2E2E' }}
            >
              The Big Three
            </h2>
          </div>
          
          {/* Streak Counter with Flame */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ 
              backgroundColor: '#FFD700',
              color: '#2E2E2E'
            }}
          >
            <Flame className="w-4 h-4" />
            <span className="font-bold text-sm">
              {streakData.streak} day streak
            </span>
          </div>
        </div>
        
        {/* Motivational Subtitle */}
        <p 
          className="text-sm"
          style={{ color: '#6B7280' }}
        >
          Focus on what matters most. Complete your Big Three to earn +{EARNING_RATES.BIG_THREE_BONUS.coins} bonus coins each! 🪙
        </p>
      </div>

      {/* Daily Intention Card */}
      {!hasAnyTasks && (
        <Card 
          className="p-6 text-center space-y-4"
          style={{ 
            backgroundColor: '#FEFEFE',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="text-3xl">✨</div>
          <p 
            className="text-base"
            style={{ color: '#4B5563' }}
          >
            Set your Big Three to start the day!
          </p>
          <Button
            onClick={() => setShowIntention(true)}
            className="font-bold text-white px-6 py-3"
            style={{ 
              backgroundColor: '#66D9A6',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5BC89A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#66D9A6';
            }}
          >
            Set Daily Intention
          </Button>
        </Card>
      )}

      {/* Task Input Areas */}
      {hasAnyTasks && (
        <div className="space-y-4">
          {[0, 1, 2].map((index) => {
            const task = bigThreeTasks[index];
            return (
              <Card
                key={index}
                className={`p-4 transition-all duration-200 ${
                  task?.completed ? 'opacity-75' : 'hover:shadow-md'
                }`}
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  minHeight: '48px'
                }}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={task?.completed || false}
                    onCheckedChange={() => toggleTaskCompleted(index)}
                    className="scale-125"
                    disabled={!task?.title?.trim()}
                  />
                  <Input
                    value={task?.title || ""}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Your priority task ${index + 1}`}
                    className="border-none bg-transparent text-base font-medium shadow-none focus-visible:ring-0"
                    style={{ 
                      color: task?.completed ? '#6B7280' : '#2E2E2E'
                    }}
                  />
                  {task?.completed && (
                    <div className="flex items-center gap-2 text-green-600 animate-bounce">
                      <Coins className="w-5 h-5" />
                      <span className="text-sm font-bold">+{EARNING_RATES.BIG_THREE_BONUS.coins}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions Section */}
      {hasAnyTasks && (
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => navigate('/tools/focus')}
            className="flex items-center gap-2 p-3 font-bold text-white rounded-lg"
            style={{ 
              backgroundColor: '#FF6B47',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF5A35';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF6B47';
            }}
          >
            <span className="text-lg">🍅</span>
            <span className="text-sm">Focus</span>
          </Button>

          <Button
            onClick={() => navigate('/arcade')}
            className="flex items-center gap-2 p-3 font-bold text-white rounded-lg"
            style={{ 
              backgroundColor: '#4F96FF',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3D84FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4F96FF';
            }}
          >
            <span className="text-lg">⚔️</span>
            <span className="text-sm">Quest</span>
          </Button>

          <Button
            onClick={() => navigate('/tools/breaks')}
            className="flex items-center gap-2 p-3 font-bold text-white rounded-lg"
            style={{ 
              backgroundColor: '#8B5FBF',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7A4FA8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8B5FBF';
            }}
          >
            <span className="text-lg">☕</span>
            <span className="text-sm">Break</span>
          </Button>
        </div>
      )}

      {/* Progress Statistics */}
      {hasAnyTasks && (
        <div className="grid grid-cols-3 gap-4">
          {/* Today's Progress */}
          <Card 
            className="p-4 text-center"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          >
            <div 
              className="text-2xl font-bold"
              style={{ color: '#2E2E2E' }}
            >
              {stats.completedCount}/{stats.totalCount}
            </div>
            <div 
              className="text-xs font-medium"
              style={{ color: '#6B7280' }}
            >
              Today
            </div>
          </Card>

          {/* Week Progress */}
          <Card 
            className="p-4 text-center"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          >
            <div 
              className="text-2xl font-bold"
              style={{ color: '#2E2E2E' }}
            >
              12/21
            </div>
            <div 
              className="text-xs font-medium"
              style={{ color: '#6B7280' }}
            >
              This Week
            </div>
          </Card>

          {/* Streak */}
          <Card 
            className="p-4 text-center"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg">🔥</span>
              <span 
                className="text-xl font-bold"
                style={{ color: '#2E2E2E' }}
              >
                {streakData.streak}
              </span>
            </div>
            <div 
              className="text-xs font-medium"
              style={{ color: '#6B7280' }}
            >
              Streak
            </div>
          </Card>
        </div>
      )}

      {/* Update Intention Button */}
      {hasAnyTasks && (
        <Button
          variant="ghost"
          onClick={() => setShowIntention(true)}
          className="w-full"
          style={{ 
            color: '#6B7280',
            fontSize: '14px'
          }}
        >
          Update Daily Intention
        </Button>
      )}
    </div>
  );
}