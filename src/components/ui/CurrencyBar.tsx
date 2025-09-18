import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Star, 
  TrendingUp, 
  Zap, 
  Sparkles,
  Plus
} from 'lucide-react';
import { getCurrencyData, getDailyCurrencyData, formatCurrency, type CurrencyData } from '@/lib/unifiedCurrency';
import { onChanged } from '@/lib/bus';

interface CurrencyBarProps {
  position?: 'top-right' | 'inline';
  showEarningBreakdown?: boolean;
  onEarnMore?: () => void;
}

export default function CurrencyBar({ 
  position = 'top-right', 
  showEarningBreakdown = false,
  onEarnMore 
}: CurrencyBarProps) {
  const [currencyData, setCurrencyData] = useState<CurrencyData>(getCurrencyData());
  const [dailyData, setDailyData] = useState<CurrencyData>(getDailyCurrencyData());
  const [showNotification, setShowNotification] = useState(false);
  const [lastEarning, setLastEarning] = useState<{coins: number, gems: number} | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Update currency data when storage changes
  useEffect(() => {
    const unsubscribe = onChanged((keys: string[]) => {
      if (keys.includes('fm_unified_currency_v1')) {
        setCurrencyData(getCurrencyData());
        setDailyData(getDailyCurrencyData());
      }
    });

    return unsubscribe;
  }, []);

  // Listen for currency earning events
  useEffect(() => {
    const handleCurrencyEarned = (event: CustomEvent) => {
      const { coins, gems } = event.detail;
      setLastEarning({ coins, gems });
      setShowNotification(true);
      setAnimationKey(prev => prev + 1);
      
      setTimeout(() => setShowNotification(false), 3000);
    };

    window.addEventListener('currencyEarned', handleCurrencyEarned as EventListener);
    return () => {
      window.removeEventListener('currencyEarned', handleCurrencyEarned as EventListener);
    };
  }, []);

  const containerClass = position === 'top-right' 
    ? 'fixed top-4 right-4 z-40' 
    : 'w-full';

  const cardClass = position === 'top-right'
    ? 'bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl'
    : 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-purple-500/10 backdrop-blur-sm';

  return (
    <div className={containerClass}>
      {/* Currency earned notification */}
      {showNotification && lastEarning && position === 'top-right' && (
        <div className="mb-2 animate-bounce-in">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-none shadow-2xl">
            <CardContent className="p-3 flex items-center gap-2">
              {lastEarning.coins > 0 && (
                <>
                  <Coins className="w-6 h-6 text-white" />
                  <span className="text-white font-bold">+{lastEarning.coins}</span>
                </>
              )}
              {lastEarning.gems > 0 && (
                <>
                  <Star className="w-6 h-6 text-white" />
                  <span className="text-white font-bold">+{lastEarning.gems}</span>
                </>
              )}
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </CardContent>
          </Card>
        </div>
      )}

      <Card className={cardClass}>
        <CardContent className={`${position === 'top-right' ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1">
              <div className={`
                relative p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500
                transition-transform duration-500 ${animationKey > 0 ? 'scale-110' : 'scale-100'}
                shadow-md
              `}>
                <Coins className="w-4 h-4 text-white" />
                {/* Coin shine effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                  rounded-full transform rotate-45 translate-x-[-100%] 
                  ${animationKey > 0 ? 'translate-x-[100%]' : ''}
                  transition-transform duration-700 ease-out
                `} />
              </div>
              <span className="font-bold text-lg text-yellow-600">
                {formatCurrency(currencyData.coins)}
              </span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1">
              <div className={`
                relative p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                transition-transform duration-500 ${animationKey > 0 ? 'scale-110' : 'scale-100'}
                shadow-md
              `}>
                <Star className="w-4 h-4 text-white" />
                {/* Gem sparkle effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                  rounded-full transform rotate-45 translate-x-[-100%] 
                  ${animationKey > 0 ? 'translate-x-[100%]' : ''}
                  transition-transform duration-700 ease-out delay-100
                `} />
              </div>
              <span className="font-bold text-lg text-purple-600">
                {formatCurrency(currencyData.gems)}
              </span>
            </div>

            {/* Earn more button (for inline mode) */}
            {position === 'inline' && onEarnMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEarnMore}
                className="ml-auto bg-white/50 border-primary/30 hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Earn More
              </Button>
            )}
          </div>

          {/* Daily earning breakdown (for inline mode) */}
          {position === 'inline' && showEarningBreakdown && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Today earned:</span>
                <div className="flex items-center gap-2">
                  {dailyData.dailyEarned.coins > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Coins className="w-3 h-3 mr-1" />
                      +{formatCurrency(dailyData.dailyEarned.coins)}
                    </Badge>
                  )}
                  {dailyData.dailyEarned.gems > 0 && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Star className="w-3 h-3 mr-1" />
                      +{formatCurrency(dailyData.dailyEarned.gems)}
                    </Badge>
                  )}
                  {dailyData.dailyEarned.coins === 0 && dailyData.dailyEarned.gems === 0 && (
                    <span className="text-muted-foreground text-xs">No earnings yet</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}