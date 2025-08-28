import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { getTodaysWins, formatWinTime } from '@/lib/dailyWins';

export function DailyWinsTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const wins = getTodaysWins();

  if (wins.length === 0) {
    return null; // Don't show if no wins yet
  }

  return (
    <Card className="bg-gradient-to-r from-background to-muted/30 border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="text-lg">🏆</div>
                Daily Wins
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                  {wins.length}
                </div>
              </CardTitle>
              <Button variant="ghost" size="sm" className="p-1">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {wins.map((win) => (
                <div 
                  key={win.id} 
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/10"
                >
                  <div className="text-lg mt-0.5">✅</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {win.taskTitle}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatWinTime(win.completedAt)}
                      </span>
                    </div>
                    
                    {win.celebrationNote && (
                      <div className="flex items-start gap-2 mt-2">
                        <Trophy className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          "{win.celebrationNote}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-4 pt-3 border-t border-border/20">
                <p className="text-xs text-muted-foreground">
                  🌟 Keep celebrating your achievements!
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}