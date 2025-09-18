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
  "Time to earn more gaming time! Complete a task to unlock more arcade fun.",
  "Your productivity powers up your play time. Finish something from your Big Three to earn tokens.",
  "Almost there! Check off a task and you'll be back to gaming in no time.",
  "Productivity first, games second - that's the secret to guilt-free fun!",
  "Your future self will thank you. Complete a task, then come back and play!"
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
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Almost Ready to Play!
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
            <p className="text-sm text-muted-foreground">
              You need {tokensNeeded - currentTokens} more tokens to play
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
              How to Earn Tokens:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Complete daily tasks (+5 tokens each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Finish Big Three goals (+10 tokens each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Pomodoro sessions (+3 tokens each)
              </li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Link to="/dashboard" onClick={onClose}>
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <CheckSquare className="w-4 h-4 mr-2" />
                View My Tasks
              </Button>
            </Link>
            
            <Link to="/" onClick={onClose}>
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Check My Big Three
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
              🎯 <strong>Remember:</strong> Every task completed is a step towards your goals!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}