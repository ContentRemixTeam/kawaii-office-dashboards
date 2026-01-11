import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CurrencyBar from '@/components/ui/CurrencyBar';
import ModeSelector from '@/components/ui/ModeSelector';
import PetStoreModeContent from './PetStoreModeContent';
// Note: DesignStudioModeContent preserved for future use
// import DesignStudioModeContent from './DesignStudioModeContent';
import TaskArcadeModeContent from './TaskArcadeModeContent';
import { getCurrencyData } from '@/lib/unifiedCurrency';
import { readEarnedAnimals, readPetStage } from '@/lib/topbarState';
import { onChanged } from '@/lib/bus';

export default function UnifiedModeAwareDashboard() {
  const [selectedMode, setSelectedMode] = useState<'pet-store' | 'task-arcade'>('pet-store');
  const [currencyData, setCurrencyData] = useState(getCurrencyData());
  const [earnedAnimals, setEarnedAnimals] = useState<string[]>([]);
  const [petStage, setPetStage] = useState(0);

  useEffect(() => {
    setCurrencyData(getCurrencyData());
    setEarnedAnimals(readEarnedAnimals());
    const petData = readPetStage();
    setPetStage(petData.stage || 0);
  }, []);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged((keys: string[]) => {
      if (keys.includes('fm_unified_currency_v1')) {
        setCurrencyData(getCurrencyData());
      }
      if (keys.includes('fm_earned_animals_v1')) {
        setEarnedAnimals(readEarnedAnimals());
      }
      if (keys.includes('fm_pet_stage_v1')) {
        const petData = readPetStage();
        setPetStage(petData.stage || 0);
      }
    });

    return unsubscribe;
  }, []);

  const renderModeContent = () => {
    switch (selectedMode) {
      case 'pet-store':
        return <PetStoreModeContent earnedAnimals={earnedAnimals} petStage={petStage} />;
      case 'task-arcade':
        return <TaskArcadeModeContent 
          tokens={currencyData.coins} 
          todayEarned={currencyData.dailyEarned.coins} 
          totalEarned={currencyData.totalEarned.coins} 
        />;
      default:
        return <PetStoreModeContent earnedAnimals={earnedAnimals} petStage={petStage} />;
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section Background */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/10 shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Top Row: Currency Bar */}
          <div className="flex justify-end">
            <div className="w-auto">
              <CurrencyBar position="inline" showEarningBreakdown />
            </div>
          </div>
          
          {/* Mode Selector */}
          <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
          
          {/* Mode-Specific Content */}
          <div className="min-h-[300px]">
            {renderModeContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}