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

// Note: Design Studio removed from nav - files preserved for future use
// To re-enable: { label: "Design Studio", href: "/design", emoji: "💖" },
export const NAV_ITEMS: NavItem[] = [
  { label: "Pet Store Mode", href: "/tools/tasks", emoji: "🐾" },
  { label: "Pomodoro Timer", href: "/tools/focus", emoji: "⏰" },
  { label: "Break Room", href: "/tools/break-room", emoji: "🛋️" },
  { label: "Soundscapes", href: "/tools/sounds", emoji: "🎵" },
  { label: "Theme", href: "/tools/theme", emoji: "🎨" },
  { label: "Positivity Corner", href: "/tools/positivity-cabinet", emoji: "💖" }
];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Tools",
    emoji: "🔧",
    items: NAV_ITEMS
  }
];