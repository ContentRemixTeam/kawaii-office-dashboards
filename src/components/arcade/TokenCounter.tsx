import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Star, Zap } from 'lucide-react';

interface TokenCounterProps {
  currentTokens: number;
  todayEarned: number;
  totalEarned: number;
  onEarnMore: () => void;
}

export default function TokenCounter({ 
  currentTokens, 
  todayEarned, 
  totalEarned, 
  onEarnMore 
}: TokenCounterProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setIsGlowing(true);
    const timer = setTimeout(() => setIsGlowing(false), 2000);
    return () => clearTimeout(timer);
  }, [currentTokens]);

  return (
    <div className="relative">
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`particle-${animationKey}-${i}`}
            className={`
              absolute animate-bounce text-yellow-400 opacity-60
              ${i % 2 === 0 ? 'animate-pulse' : ''}
            `}
            style={{
              left: `${20 + i * 12}%`,
              top: `${10 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <Card className={`
        relative overflow-hidden border-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-600/10
        backdrop-blur-sm transition-all duration-500
        ${isGlowing ? 'shadow-2xl shadow-yellow-500/25 scale-105' : 'shadow-xl'}
      `}>
        {/* Animated background glow */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20
          transition-opacity duration-1000 ${isGlowing ? 'opacity-100' : 'opacity-30'}
        `} />
        
        <CardContent className="relative p-6">
          {/* Main token display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className={`
                relative p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500
                transition-transform duration-500 ${isGlowing ? 'scale-110 rotate-12' : 'scale-100'}
                shadow-lg
              `}>
                <Coins className={`w-8 h-8 text-white transition-transform duration-500 ${isGlowing ? 'rotate-180' : ''}`} />
                
                {/* Coin shine effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                  rounded-full transform rotate-45 translate-x-[-100%] 
                  ${isGlowing ? 'translate-x-[100%]' : ''}
                  transition-transform duration-700 ease-out
                `} />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className={`
                text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 
                bg-clip-text text-transparent transition-all duration-500
                ${isGlowing ? 'scale-110' : 'scale-100'}
              `}>
                {currentTokens.toLocaleString()}
              </div>
              <div className="text-muted-foreground font-medium">Gaming Tokens</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
              <div className="text-lg font-bold text-green-600">+{todayEarned}</div>
            </div>
            
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <div className="text-lg font-bold text-purple-600">{totalEarned.toLocaleString()}</div>
            </div>
          </div>

          {/* Earn more section */}
          <div className="text-center">
            <button
              onClick={onEarnMore}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-gradient-to-r from-primary/20 to-primary/30 
                border border-primary/30 text-primary hover:from-primary/30 hover:to-primary/40
                transition-all duration-300 hover:scale-105 hover:shadow-lg
                font-medium
              `}
            >
              <Zap className="w-4 h-4" />
              Earn More Tokens
            </button>
          </div>

          {/* Achievement badges */}
          <div className="flex justify-center gap-2 mt-4">
            {totalEarned >= 100 && (
              <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                🎯 Century Club
              </Badge>
            )}
            {todayEarned >= 10 && (
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                🔥 Daily Streak
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}