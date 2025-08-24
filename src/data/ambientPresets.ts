export type AmbientPreset = {
  id: string;            // slug key
  title: string;         // display name
  youtube: string;       // full URL to video or playlist
  emoji: string;         // icon
};

export const AMBIENT_PRESETS: AmbientPreset[] = [
  { id: "rain",      title: "Rain Window",     emoji: "🌧️", youtube: "https://www.youtube.com/watch?v=lpa8uy4r4YQ" },
  { id: "cafe",      title: "Cozy Café",       emoji: "☕",  youtube: "https://www.youtube.com/watch?v=H6qk_5fXy0k" },
  { id: "fireplace", title: "Fireplace",       emoji: "🔥",  youtube: "https://www.youtube.com/watch?v=stJjS3UeJ8U" },
  { id: "ocean",     title: "Ocean Waves",     emoji: "🌊",  youtube: "https://www.youtube.com/watch?v=DWyH1Z0Jx0E" },
  { id: "birds",     title: "Morning Birds",   emoji: "🐦",  youtube: "https://www.youtube.com/watch?v=3wP1cZJ1lNs" },
  { id: "lofi",      title: "Lo-Fi Beats",     emoji: "🎵",  youtube: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
];