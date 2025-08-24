import ToolShell from "@/components/ToolShell";

export default function Vision() {
  return (
    <ToolShell title="Vision Board">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🎨 Manifest Your Dreams</h2>
          <p className="text-primary-foreground/90">
            Create a beautiful visual representation of your goals and dreams. Drag and drop images, add inspiring quotes, and watch your vision come to life!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🖼️ Image Gallery</h3>
            <p className="text-muted-foreground text-sm">Upload and organize inspiring images</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">💭 Dream Board</h3>
            <p className="text-muted-foreground text-sm">Arrange your vision collage</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}