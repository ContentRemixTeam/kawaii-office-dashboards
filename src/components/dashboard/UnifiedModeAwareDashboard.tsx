import React, { useState, useEffect } from 'react';
import CurrencyBar from '@/components/ui/CurrencyBar';
import ModeSelector from '@/components/ui/ModeSelector';
import PetStoreModeContent from './PetStoreModeContent';
import DesignStudioModeContent from './DesignStudioModeContent';
import TaskArcadeModeContent from './TaskArcadeModeContent';
import { getCurrencyData } from '@/lib/unifiedCurrency';
import { readEarnedAnimals, readPetStage } from '@/lib/topbarState';

export default function UnifiedModeAwareDashboard() {
  const [selectedMode, setSelectedMode] = useState<'pet-store' | 'design-studio' | 'task-arcade'>('pet-store');
  const [currencyData, setCurrencyData] = useState(getCurrencyData());
  const [earnedAnimals, setEarnedAnimals] = useState<string[]>([]);
  const [petStage, setPetStage] = useState(0);

  useEffect(() => {
    setCurrencyData(getCurrencyData());
    setEarnedAnimals(readEarnedAnimals());
    const petData = readPetStage();
    setPetStage(petData.stage || 0);
  }, []);

  const renderModeContent = () => {
    switch (selectedMode) {
      case 'pet-store':
        return <PetStoreModeContent earnedAnimals={earnedAnimals} petStage={petStage} />;
      case 'design-studio':
        return <DesignStudioModeContent coins={currencyData.coins} gems={currencyData.gems} />;
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
    <div className="space-y-6">
      {/* Universal Currency Bar */}
      <CurrencyBar position="inline" showEarningBreakdown />
      
      {/* Mode Selector */}
      <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
      
      {/* Mode-Specific Content */}
      {renderModeContent()}
    </div>
  );
}