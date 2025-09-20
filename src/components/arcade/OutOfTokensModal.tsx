import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Coins,
  CheckSquare,
  Target,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';

interface OutOfTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTokens: number;
  tokensNeeded: number;
  gameName: string;
}

const ENCOURAGING_MESSAGES = [
  "🎮 Time to power up! Complete tasks to unlock more gaming energy and continue your adventure.",
  "⚡ Your productivity fuel is running low! Finish a task from your Big Three to recharge your gaming tokens.",
  "🚀 Almost there! Check off any task and you'll be back to gaming in no time with more energy.",
  "🎯 Productivity first, games second - that's the secret to guilt-free, unlimited fun!",
  "✨ Your future self will thank you! Complete a task, then return for more epic gaming sessions.",
  "🔋 Gaming energy depleted! Restore power by completing tasks - every task gives you more play time!",
  "🌟 The more you accomplish, the more you can play! Complete tasks to unlock extended gaming sessions."
];

export default function OutOfTokensModal({ 
  isOpen, 
  onClose, 
  currentTokens, 
  tokensNeeded, 
  gameName 
}: OutOfTokensModalProps) {
  // Rotate through encouraging messages
  const [messageIndex] = useState(() => Math.floor(Math.random() * ENCOURAGING_MESSAGES.length));
  const encouragingMessage = ENCOURAGING_MESSAGES[messageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-white border-2 border-orange-400 rounded-full flex items-center justify-center shadow-sm">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            ⚡ Need More Gaming Energy! ⚡
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Token Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="text-sm">
                <Coins className="w-3 h-3 mr-1" />
                {currentTokens} tokens
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge className="text-sm bg-primary text-primary-foreground">
                Need {tokensNeeded} for {gameName}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Complete {tokensNeeded - currentTokens} more tasks to unlock this game and get more gaming energy!
            </p>
          </div>
          
          {/* Encouraging Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {encouragingMessage}
              </p>
            </div>
          </div>
          
          {/* How to Earn Tokens */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border">
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              How to Get More Gaming Energy:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Complete any daily task (+5 gaming tokens each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Finish Big Three goals (+10 gaming tokens each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Complete Pomodoro sessions (+3 gaming tokens each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                🎮 <strong>Bonus:</strong> Completing tasks gives you longer play sessions!
              </li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Link to="/dashboard" onClick={onClose}>
              <Button variant="gradient-primary" className="w-full">
                <CheckSquare className="w-4 h-4 mr-2" />
                <span className="font-bold">Complete Tasks & Earn Energy</span>
              </Button>
            </Link>
            
            <Link to="/" onClick={onClose}>
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Check My Big Three Goals
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={onClose} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Maybe Later
            </Button>
          </div>
          
          {/* Motivation Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              🎯 <strong>Pro Tip:</strong> Complete tasks to unlock unlimited gaming time with bonus energy! ⚡
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}