import { getDailyData } from "@/lib/storage";

interface DailySummaryProps {
  className?: string;
}

export default function DailySummary({ className = "" }: DailySummaryProps) {
  // Get today's stats from localStorage
  const getTaskStats = () => {
    const taskData = getDailyData("fm_tasks_v1", {
      completed: [false, false, false],
      roundsCompleted: 0,
      totalTasksCompleted: 0
    });
    const completedToday = taskData.completed.filter(Boolean).length;
    const totalRounds = taskData.roundsCompleted || 0;
    return { completedToday, totalRounds, totalTasksCompleted: taskData.totalTasksCompleted || 0 };
  };

  const getPomodoroStats = () => {
    // Get from PomodoroTimer's localStorage key
    const pomodoroData = getDailyData("fm_pomodoro_daily_v1", { 
      completedSessions: 0,
      totalMinutes: 0 
    });
    return pomodoroData.completedSessions || 0;
  };

  const getWinsStats = () => {
    // Get from Daily Wins storage
    const winsData = getDailyData("fm_wins_v1", { wins: [] });
    return winsData.wins.length || 0;
  };

  const { completedToday, totalRounds } = getTaskStats();
  const pomodoroCount = getPomodoroStats();
  const winsCount = getWinsStats();

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
        📊 Your Amazing Day
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pomodoros */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-2xl p-4 text-center border border-red-200/50 dark:border-red-800/50">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            {pomodoroCount}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300 font-medium">
            You focused for {pomodoroCount} Pomodoro{pomodoroCount !== 1 ? 's' : ''} today!
          </div>
        </div>

        {/* Task Pets */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-2xl p-4 text-center border border-green-200/50 dark:border-green-800/50">
          <div className="text-3xl mb-2">🐾</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {totalRounds}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 font-medium">
            You earned {totalRounds} Task Pet{totalRounds !== 1 ? 's' : ''} today!
          </div>
        </div>

        {/* Daily Wins */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 rounded-2xl p-4 text-center border border-yellow-200/50 dark:border-yellow-800/50">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
            {winsCount}
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
            You celebrated {winsCount} win{winsCount !== 1 ? 's' : ''} today!
          </div>
        </div>
      </div>
      
      {/* Overall message */}
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground font-medium">
          {completedToday === 3 && pomodoroCount > 0 && winsCount > 0 ? 
            "🌟 You absolutely crushed it today! Amazing work!" :
            "🌱 Every step forward is progress worth celebrating!"
          }
        </div>
      </div>
    </div>
  );
}