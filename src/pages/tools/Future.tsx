import ToolShell from "@/components/ToolShell";
import { safeGet, safeSet, generateId } from "@/lib/storage";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Heart } from "lucide-react";

interface Note {
  id: string;
  text: string;
  date: string;
}

export default function Future() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setNotes(safeGet("fm_future_notes_v1", []));
  }, []);

  function addNote() {
    if (!input.trim()) return;
    const newNote: Note = {
      id: generateId(),
      text: input.trim(),
      date: new Date().toISOString()
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    safeSet("fm_future_notes_v1", newNotes);
    setInput("");
  }

  function removeNote(id: string) {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    safeSet("fm_future_notes_v1", newNotes);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.ctrlKey) {
      addNote();
    }
  }

  return (
    <ToolShell title="Future-You Notes">
      <div className="space-y-6">
        <div className="bg-gradient-subtle rounded-2xl p-6 border border-border/20">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-main">Write to Future You</h3>
          </div>
          
          <p className="text-muted-foreground mb-4 text-sm">
            Write encouraging notes that will randomly appear during celebrations. 
            Be kind to your future self! 💕
          </p>
          
          <div className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="You're stronger than you think... Keep going, you've got this! ✨"
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Ctrl + Enter to save
              </span>
              <Button 
                onClick={addNote} 
                disabled={!input.trim()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-main flex items-center gap-2">
              <span>Your Encouragement Collection</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {notes.length}
              </span>
            </h4>
            
            <div className="grid gap-3">
              {notes.map((note) => (
                <Card key={note.id} className="bg-gradient-card border-border/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-main leading-relaxed flex-1">
                        {note.text}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNote(note.id)}
                        className="opacity-50 hover:opacity-100 text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(note.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No future notes yet. Start writing encouragements to yourself!</p>
          </div>
        )}
      </div>
    </ToolShell>
  );
}