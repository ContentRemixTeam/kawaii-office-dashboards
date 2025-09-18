import ToolShell from "@/components/ToolShell";
import AmbientPlayer from "@/components/AmbientPlayer";

export default function Sounds() {
  return (
    <ToolShell title="Ambient Soundscapes">
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-3">🎵 YouTube Ambient Player</h2>
          <p className="text-muted-foreground">
            Create the perfect working atmosphere with ambient YouTube videos. Choose from curated presets or add your own custom ambient videos for focus and relaxation.
          </p>
        </div>

        <AmbientPlayer />

        {/* Instructions */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/10">
          <h3 className="font-medium text-main mb-2">🎧 How to use</h3>
          <ul className="text-sm text-muted space-y-1">
            <li>• Click any preset to start ambient video soundscape</li>
            <li>• Use custom YouTube URLs for personalized ambience</li>
            <li>• Control volume and mute settings</li>
            <li>• Optionally use the video as your office background</li>
            <li>• Your preferences are automatically saved</li>
          </ul>
        </div>
      </div>
    </ToolShell>
  );
}