import { Home, Settings2, LayoutDashboard } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  emoji: string;
  icon?: any; // Lucide icon component
}

export interface NavSection {
  title: string;
  emoji: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Daily Habits",
    emoji: "🌱",
    items: [
      { label: "Task Pets", href: "/tools/tasks", emoji: "🐾" },
      { label: "Energy Word", href: "/tools/energy", emoji: "⚡" },
      { label: "Habit Garden", href: "/tools/habits", emoji: "🌿" }
    ]
  },
  {
    title: "Focus Tools", 
    emoji: "🎯",
    items: [
      { label: "Pomodoro Timer", href: "/tools/focus", emoji: "⏰" },
      { label: "Beat the Clock", href: "/tools/beat-clock", emoji: "🚀" }
    ]
  },
  {
    title: "Positivity Hub",
    emoji: "✨",
    items: [
      { label: "Positivity Cabinet", href: "/tools/positivity-cabinet", emoji: "💖" },
      { label: "Vision Board", href: "/tools/vision", emoji: "🌈" },
      { label: "Soundscapes", href: "/tools/sounds", emoji: "🎵" },
      { label: "Theme", href: "/tools/theme", emoji: "🎨" }
    ]
  }
];

// Legacy export for compatibility
export const NAV_ITEMS = NAV_SECTIONS.flatMap(section => section.items);