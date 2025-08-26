import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentWins, getTodayWins } from '@/lib/winsStorage';
import { getTrophyStats } from '@/lib/trophySystem';
import type { Win } from '@/lib/winsStorage';

export function RecentWinsPanel() {
  const [recentWins, setRecentWins] = useState<Win[]>([]);
  const [todayWins, setTodayWins] = useState<Win[]>([]);
  const [todayTrophies, setTodayTrophies] = useState(0);

  useEffect(() => {
    const loadData = () => {
      setRecentWins(getRecentWins(3));
      setTodayWins(getTodayWins());
      setTodayTrophies(getTrophyStats().todayTrophies);
    };

    loadData();

    // Listen for changes
    const handleWinsChange = () => loadData();
    const handleTrophyChange = () => loadData();

    window.addEventListener('winsChanged', handleWinsChange);
    window.addEventListener('fm:data-changed', handleTrophyChange);

    return () => {
      window.removeEventListener('winsChanged', handleWinsChange);
      window.removeEventListener('fm:data-changed', handleTrophyChange);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🎉 Daily Wins
          </span>
          {todayTrophies > 0 && (
            <Badge variant="secondary" className="text-xs">
              🏆 {todayTrophies} {todayTrophies === 1 ? 'trophy' : 'trophies'} today
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentWins.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm">Complete a task to start celebrating wins!</p>
          </div>
        ) : (
          <>
            {recentWins.map((win) => (
              <div key={win.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1">{win.text}</p>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {formatDate(win.date)}
                  </Badge>
                </div>
                {win.source === 'task' && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    ⭐ Task completion
                  </div>
                )}
              </div>
            ))}
            {todayWins.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  🎯 {todayWins.length} {todayWins.length === 1 ? 'win' : 'wins'} today
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}