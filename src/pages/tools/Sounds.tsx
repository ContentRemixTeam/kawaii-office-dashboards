import ToolShell from "@/components/ToolShell";

export default function Sounds() {
  return (
    <ToolShell title="Soundscapes & Reminders">
      <div className="space-y-6">
        <div className="bg-gradient-mint rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-secondary-foreground mb-3">🎵 Ambient Atmosphere</h2>
          <p className="text-secondary-foreground/80">
            Create the perfect working atmosphere with soothing soundscapes and gentle reminders to keep you focused and calm throughout your day.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌧️ Rain Sounds</h3>
            <p className="text-muted-foreground text-sm">Gentle rainfall ambience</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">☕ Café Vibes</h3>
            <p className="text-muted-foreground text-sm">Cozy coffee shop atmosphere</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🔔 Gentle Reminders</h3>
            <p className="text-muted-foreground text-sm">Mindful break notifications</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}