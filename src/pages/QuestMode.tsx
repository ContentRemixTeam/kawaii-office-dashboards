import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Crown, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterCreation, Character, calculateLevel } from '@/components/quest/CharacterCreation';
import CharacterDisplay from '@/components/quest/CharacterDisplay';
import QuestSystem from '@/components/quest/QuestSystem';
import QuestWelcome from '@/components/quest/QuestWelcome';
import QuestInstructions from '@/components/quest/QuestInstructions';

const QUEST_CHARACTER_KEY = 'quest_character_v1';
const QUEST_STORAGE_PREFIX = 'quest_mode_';

export default function QuestMode() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Load existing character
    const savedCharacter = localStorage.getItem(QUEST_CHARACTER_KEY);
    const hasSeenWelcome = localStorage.getItem('quest_seen_welcome');
    
    if (savedCharacter) {
      try {
        const parsed = JSON.parse(savedCharacter);
        setCharacter(parsed);
      } catch (error) {
        console.error('Failed to load character:', error);
      }
    } else if (!hasSeenWelcome) {
      // First time user - show welcome
      setShowWelcome(true);
    }
    setIsLoading(false);
  }, []);

  const handleCharacterCreated = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setShowWelcome(false);
    localStorage.setItem('quest_seen_welcome', 'true');
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    localStorage.setItem('quest_seen_welcome', 'true');
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  const handleQuestComplete = (questId: string, expGained: number) => {
    if (!character) return;

    const updatedCharacter = {
      ...character,
      experience: character.experience + expGained,
      totalTasksCompleted: character.totalTasksCompleted + 1
    };

    // Check for level up
    const oldLevel = calculateLevel(character.experience);
    const newLevel = calculateLevel(updatedCharacter.experience);
    
    if (newLevel > oldLevel) {
      // Level up! Update stats
      const classData = require('@/components/quest/CharacterCreation').CHARACTER_CLASSES[character.class];
      const levelDiff = newLevel - oldLevel;
      
      updatedCharacter.stats = {
        strength: Math.floor(character.stats.strength + (classData.growthRates.strength * levelDiff)),
        intelligence: Math.floor(character.stats.intelligence + (classData.growthRates.intelligence * levelDiff)),
        agility: Math.floor(character.stats.agility + (classData.growthRates.agility * levelDiff)),
        wisdom: Math.floor(character.stats.wisdom + (classData.growthRates.wisdom * levelDiff))
      };
      
      updatedCharacter.level = newLevel;

      // Add level up achievement
      if (!updatedCharacter.achievements.includes(`Reached Level ${newLevel}`)) {
        updatedCharacter.achievements.push(`Reached Level ${newLevel}`);
      }
    }

    setCharacter(updatedCharacter);
    localStorage.setItem(QUEST_CHARACTER_KEY, JSON.stringify(updatedCharacter));
  };

  const handleResetCharacter = () => {
    // Clear all quest mode data - completely separate from arcade
    localStorage.removeItem(QUEST_CHARACTER_KEY);
    localStorage.removeItem('quest_active_quests');
    localStorage.removeItem('quest_completed_quests');
    localStorage.removeItem('quest_daily_progress');
    localStorage.removeItem('quest_weekly_progress');
    setCharacter(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen for first-time users
  if (showWelcome) {
    return (
      <QuestWelcome 
        onGetStarted={handleGetStarted}
        onShowInstructions={handleShowInstructions}
      />
    );
  }

  // Show character creation if no character exists
  if (!character) {
    return <CharacterCreation onCharacterCreated={handleCharacterCreated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Instructions Modal */}
      {showInstructions && (
        <QuestInstructions 
          onClose={handleCloseInstructions}
          onStartAdventure={handleGetStarted}
        />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="bg-black/20 border-purple-500/30 text-white hover:bg-black/30 hover:border-purple-400/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                Quest Mode
              </h1>
              <p className="text-blue-200 mt-2">
                Transform your productivity into epic adventures
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleShowInstructions}
              variant="outline"
              className="bg-black/20 border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Guide
            </Button>
            <Button 
              onClick={handleResetCharacter}
              variant="outline"
              className="bg-red-900/20 border-red-500/30 text-red-200 hover:bg-red-900/30"
            >
              Reset Character
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Character Display */}
          <CharacterDisplay character={character} />
          
          {/* Quest System */}
          <QuestSystem 
            character={character} 
            onQuestComplete={handleQuestComplete}
          />
        </div>
      </div>
    </div>
  );
}