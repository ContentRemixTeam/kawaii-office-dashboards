import { Hotspot } from "@/components/HotspotImage";
import kawaiiOfficeImg from "@/assets/kawaii-office.png";

export const OFFICE_IMAGE_SRC = kawaiiOfficeImg;
export const OFFICE_ALT = "Cozy kawaii office with desk, monitor, filing cabinet, plants, clock and bulletin board.";

export const HOTSPOTS: Hotspot[] = [
  {
    id: "monitor",
    label: "Daily Task Pets + Intention",
    href: "/tools/tasks",
    top: 35,
    left: 35,
    width: 30,
    height: 25,
    aria: "Open Daily Task Pets tool"
  },
  {
    id: "cabinet",
    label: "Positivity Filing Cabinet",
    href: "/tools/cabinet",
    top: 45,
    left: 5,
    width: 20,
    height: 35,
    aria: "Open Positivity Filing Cabinet"
  },
  {
    id: "board",
    label: "Vision Board",
    href: "/tools/vision",
    top: 20,
    left: 70,
    width: 25,
    height: 30,
    aria: "Open Vision Board tool"
  },
  {
    id: "clock",
    label: "Sound & Reminders",
    href: "/tools/sounds",
    top: 10,
    left: 75,
    width: 15,
    height: 15,
    aria: "Open Soundscapes and Reminders"
  },
  {
    id: "plant-right",
    label: "Affirmation Cards",
    href: "/tools/affirmations",
    top: 60,
    left: 80,
    width: 15,
    height: 20,
    aria: "Open Affirmation Cards"
  },
  {
    id: "piggy",
    label: "Money Celebration Tracker",
    href: "/tools/money",
    top: 65,
    left: 65,
    width: 12,
    height: 15,
    aria: "Open Money Celebration Tracker"
  },
  {
    id: "left-tools",
    label: "Energy Word Selector",
    href: "/tools/energy",
    top: 60,
    left: 15,
    width: 15,
    height: 20,
    aria: "Open Energy Word Selector"
  },
  {
    id: "breaks",
    label: "Mini Guided Breaks",
    href: "/tools/breaks",
    top: 75,
    left: 40,
    width: 20,
    height: 15,
    aria: "Open Mini Guided Breaks"
  },
  {
    id: "habits",
    label: "Habit Garden",
    href: "/tools/habits",
    top: 25,
    left: 50,
    width: 12,
    height: 18,
    aria: "Open Habit Garden"
  },
];