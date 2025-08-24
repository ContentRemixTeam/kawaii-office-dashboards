import { safeGet } from "@/lib/storage";

interface Note {
  id: string;
  text: string;
  date: string;
}

interface CabinetItem {
  id: string;
  content: string;
  category?: string;
}

const DEFAULT_ENCOURAGEMENTS = [
  "You're doing amazing! 💖",
  "Keep going, you've got this! ✨",
  "Every step forward is progress 🌟",
  "You're stronger than you know 💪",
  "Believe in yourself! 🌈",
  "You're making it happen! 🚀",
  "Your effort is paying off! 🎉",
  "You're worthy of all good things 💕"
];

export function getRandomEncouragement(): string {
  const futureNotes = safeGet("fm_future_notes_v1", []) as Note[];
  const cabinetItems = safeGet("fm_cabinet_v1", []) as CabinetItem[];
  
  const encouragements: string[] = [];
  
  // Add Future-You Notes (primary source)
  futureNotes.forEach(note => encouragements.push(note.text));
  
  // Add Cabinet items labeled as "Kind Words" or similar encouraging content
  cabinetItems.forEach(item => {
    if (item.category === 'Kind Words' || 
        item.content.includes('you') || 
        item.content.includes('yourself') ||
        item.content.toLowerCase().includes('encourage') ||
        item.content.toLowerCase().includes('motivat')) {
      encouragements.push(item.content);
    }
  });
  
  // If no user content, use defaults
  if (encouragements.length === 0) {
    return DEFAULT_ENCOURAGEMENTS[Math.floor(Math.random() * DEFAULT_ENCOURAGEMENTS.length)];
  }
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}