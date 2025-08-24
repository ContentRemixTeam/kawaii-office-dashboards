import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ToolShellProps {
  title: string;
  children: React.ReactNode;
}

export default function ToolShell({ title, children }: ToolShellProps) {
  return (
    <main className="min-h-screen bg-gradient-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-card rounded-3xl shadow-cute p-8 border border-border/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-main">{title}</h1>
            </div>
            <Link 
              to="/" 
              className="btn btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Office
            </Link>
          </div>
          <div className="text-main leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}