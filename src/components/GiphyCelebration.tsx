import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getGiphyCelebrationsEnabled } from "@/lib/storage";

export interface GiphyCelebrationPayload {
  type: 'task' | 'pomodoro' | 'all-tasks';
  petType?: string;
  taskNumber?: number;
  message?: string;
}

interface GiphyCelebrationProps {
  payload: GiphyCelebrationPayload | null;
  onClose: () => void;
}

const PET_SEARCH_TERMS = {
  cat: ['cat celebration', 'happy cat', 'cat dance', 'cat party', 'cute cat'],
  dog: ['dog celebration', 'happy dog', 'dog party', 'excited dog', 'good dog'],
  dragon: ['dragon fire', 'epic celebration', 'powerful', 'victory', 'legendary'],
  unicorn: ['unicorn sparkle', 'magical celebration', 'rainbow sparkle', 'unicorn magic', 'enchanting'],
  bunny: ['bunny hop', 'cute bunny', 'rabbit celebration', 'happy bunny', 'bunny dance'],
  fox: ['fox celebration', 'clever fox', 'cute fox', 'fox party', 'happy fox'],
  panda: ['panda celebration', 'cute panda', 'panda dance', 'happy panda', 'panda party'],
  penguin: ['penguin celebration', 'cute penguin', 'penguin dance', 'happy penguin', 'waddle'],
  owl: ['owl celebration', 'wise owl', 'cute owl', 'owl party', 'smart owl'],
  hamster: ['hamster celebration', 'cute hamster', 'hamster wheel', 'tiny celebration', 'adorable hamster']
};

const GENERAL_SEARCH_TERMS = ['celebration', 'confetti', 'party', 'success', 'achievement', 'victory', 'happy dance', 'cheering'];

const CELEBRATION_MESSAGES = {
  task: (petType?: string, taskNumber?: number) => {
    const petMessages = petType ? [
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} is proud! 🐾`,
      `Your ${petType} cheers you on! ✨`,
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} power activated! ⚡`,
    ] : [];
    
    const generalMessages = [
      "Task crushed! 🎉",
      "You're on fire! 🔥", 
      "Keep going champion! 💪",
      "Amazing work! ⭐",
      "That's how it's done! 🏆"
    ];
    
    const allMessages = [...petMessages, ...generalMessages];
    return allMessages[Math.floor(Math.random() * allMessages.length)];
  },
  
  pomodoro: (petType?: string) => {
    const petMessages = petType ? [
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} applauds your focus! 👏`,
      `Your ${petType} is impressed! 🌟`,
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} sees your dedication! 👀`,
    ] : [];
    
    const generalMessages = [
      "Focus session complete! 🎯",
      "Pomodoro mastery! 🍅",
      "Concentration champion! 🧠",
      "Time well spent! ⏰",
      "Productivity unlocked! 🔓"
    ];
    
    const allMessages = [...petMessages, ...generalMessages];
    return allMessages[Math.floor(Math.random() * allMessages.length)];
  },
  
  'all-tasks': (petType?: string) => {
    const petMessages = petType ? [
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} has evolved! 🚀`,
      `Your ${petType} reached maximum power! ⚡`,
      `${petType.charAt(0).toUpperCase() + petType.slice(1)} is beaming with pride! 😊`,
    ] : [];
    
    const generalMessages = [
      "All tasks conquered! 🏆",
      "Daily domination! 👑",
      "Unstoppable force! 💥",
      "Triple victory! 🎊",
      "Perfect execution! ✨"
    ];
    
    const allMessages = [...petMessages, ...generalMessages];
    return allMessages[Math.floor(Math.random() * allMessages.length)];
  }
};

// Using curated GIF URLs instead of GIPHY API for reliability and ADHD-friendly content
const CURATED_GIFS = {
  cat: [
    'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', // Happy cat
    'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif', // Celebrating cat
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', // Cat dance
    'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif', // Excited cat
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', // Cat party
  ],
  dog: [
    'https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif', // Happy dog
    'https://media.giphy.com/media/l1J9N8zrmYCfSrQFq/giphy.gif', // Celebrating dog
    'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', // Excited dog
    'https://media.giphy.com/media/PQKlfexeEpnTq/giphy.gif', // Dog party
    'https://media.giphy.com/media/l1AsBL4S36yDJain6/giphy.gif', // Happy pup
  ],
  dragon: [
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif', // Epic celebration
    'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', // Victory
    'https://media.giphy.com/media/3og0IMJcSI8p6hYQXS/giphy.gif', // Power
    'https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif', // Achievement
    'https://media.giphy.com/media/xT1XGESDlxj0GwoDRe/giphy.gif', // Legendary
  ],
  unicorn: [
    'https://media.giphy.com/media/26FxypSnWsXS69nTW/giphy.gif', // Magical sparkles
    'https://media.giphy.com/media/l0NwNrl4BtDD7JCx2/giphy.gif', // Unicorn magic
    'https://media.giphy.com/media/xT1XGU1AHz9Fe8tmp2/giphy.gif', // Rainbow celebration
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', // Enchanting
    'https://media.giphy.com/media/xT8qBeEqnpdMbIbtVS/giphy.gif', // Sparkly celebration
  ],
  general: [
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', // Confetti celebration
    'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', // Party time
    'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', // Success celebration
    'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif', // Victory dance
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', // Achievement
  ]
};

export default function GiphyCelebration({ payload, onClose }: GiphyCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [gifUrl, setGifUrl] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check if GIPHY celebrations are enabled
    const enabled = getGiphyCelebrationsEnabled();
    setIsEnabled(enabled);
    
    if (!enabled || !payload) {
      return;
    }

    // Select appropriate GIF based on pet type
    const petType = payload.petType?.toLowerCase();
    const gifs = petType && CURATED_GIFS[petType as keyof typeof CURATED_GIFS] 
      ? CURATED_GIFS[petType as keyof typeof CURATED_GIFS]
      : CURATED_GIFS.general;
    
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    setGifUrl(randomGif);

    // Generate celebration message
    const celebrationMessage = payload.message || 
      CELEBRATION_MESSAGES[payload.type](payload.petType, payload.taskNumber);
    setMessage(celebrationMessage);

    setIsVisible(true);

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [payload]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Allow for fade-out animation
  };

  if (!isEnabled || !payload || !isVisible) {
    return null;
  }

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <div className="relative bg-gradient-kawaii rounded-2xl p-6 text-center border-2 border-primary/20 shadow-2xl animate-scale-in">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* GIF Container */}
          <div className="mb-4">
            <div className="w-48 h-36 mx-auto rounded-xl overflow-hidden bg-white/10 border border-white/20">
              {gifUrl && (
                <img
                  src={gifUrl}
                  alt="Celebration"
                  className="w-full h-full object-cover"
                  onError={() => {
                    // Fallback to a general celebration GIF if the selected one fails
                    const fallbackGif = CURATED_GIFS.general[0];
                    if (gifUrl !== fallbackGif) {
                      setGifUrl(fallbackGif);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Celebration Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary-foreground">
              {message}
            </h3>
            
            {payload.type === 'all-tasks' && (
              <p className="text-primary-foreground/80 text-sm">
                All three tasks completed! 🎊
              </p>
            )}
            
            {payload.type === 'task' && payload.taskNumber && (
              <p className="text-primary-foreground/80 text-sm">
                Task #{payload.taskNumber} complete!
              </p>
            )}
            
            {payload.type === 'pomodoro' && (
              <p className="text-primary-foreground/80 text-sm">
                Focus session finished! 🍅
              </p>
            )}
          </div>

          {/* Dismiss hint */}
          <p className="text-primary-foreground/60 text-xs mt-4">
            Tap to dismiss • Auto-closes in 6s
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}