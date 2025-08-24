import { useState, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ExternalLink } from "lucide-react";
import { safeGet, safeSet, generateId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface CabinetNote {
  id: string;
  title: string;
  text: string;
  link?: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = "fm_cabinet_v1";

const categories = [
  { id: "kindWords", label: "💌 Kind Words", description: "Compliments and encouragement" },
  { id: "testimonials", label: "📝 Testimonials", description: "Feedback and reviews" },
  { id: "wins", label: "🏆 Wins", description: "Your achievements and milestones" },
  { id: "memories", label: "✨ Memories", description: "Special moments to treasure" }
];

export default function Cabinet() {
  const [notes, setNotes] = useState<CabinetNote[]>([]);
  const [activeTab, setActiveTab] = useState("kindWords");
  const [formData, setFormData] = useState({ title: "", text: "", link: "" });
  const { toast } = useToast();

  useEffect(() => {
    const savedNotes = safeGet<CabinetNote[]>(STORAGE_KEY, []);
    setNotes(savedNotes);
  }, []);

  const saveNotes = (newNotes: CabinetNote[]) => {
    setNotes(newNotes);
    safeSet(STORAGE_KEY, newNotes);
  };

  const addNote = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and text fields.",
        variant: "destructive"
      });
      return;
    }

    const newNote: CabinetNote = {
      id: generateId(),
      title: formData.title.trim(),
      text: formData.text.trim(),
      link: formData.link.trim() || undefined,
      category: activeTab,
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setFormData({ title: "", text: "", link: "" });
    
    toast({
      title: "Note added! ✨",
      description: "Your precious memory has been safely stored."
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    
    toast({
      title: "Note removed",
      description: "The note has been deleted from your cabinet."
    });
  };

  const getCategoryNotes = (category: string) => {
    return notes.filter(note => note.category === category);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ToolShell title="Positivity Filing Cabinet">
      <div className="space-y-6">
        <div className="bg-gradient-peach rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-3">📁 Store Your Treasures</h2>
          <p className="text-accent-foreground/80">
            A beautiful digital filing system for all your positive memories, testimonials, kind words, and achievements. Never lose sight of how amazing you are!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {/* Add Note Form */}
              <div className="bg-card rounded-xl p-6 border border-border/20">
                <h3 className="font-semibold text-card-foreground mb-4">
                  Add to {category.label}
                </h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note here..."
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <Input
                    placeholder="Optional link..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                  <Button onClick={addNote} className="w-full">
                    Add Note ✨
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Your {category.label} ({getCategoryNotes(category.id).length})
                </h3>
                
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {getCategoryNotes(category.id).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No notes yet in this category.</p>
                        <p className="text-sm">Add your first {category.description.toLowerCase()}!</p>
                      </div>
                    ) : (
                      getCategoryNotes(category.id).map((note) => (
                        <div key={note.id} className="bg-card rounded-lg p-4 border border-border/20 group hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-card-foreground">{note.title}</h4>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {note.link && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0"
                                >
                                  <a href={note.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNote(note.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{note.text}</p>
                          <p className="text-xs text-muted-foreground/60">
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ToolShell>
  );
}