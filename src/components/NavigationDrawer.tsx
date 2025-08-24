import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, X, Settings } from "lucide-react";
import { NAV_ITEMS } from "@/data/nav";

export default function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-40 h-14 px-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
        >
          <Menu className="w-5 h-5 mr-2" />
          <span className="font-medium">Menu</span>
          <span className="ml-1">▸</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh] bg-card/95 backdrop-blur-lg border-t border-border/20">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-border/20">
            <h3 className="text-xl font-bold text-foreground">🛠️ Tools</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-4 h-14 text-left rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-soft" 
                      : "hover:bg-accent/50 hover:scale-[1.02]"
                  }`}
                  onClick={() => handleNavigate(item.href)}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-semibold">{item.label}</span>
                </Button>
              );
            })}
            
            {/* Settings Section */}
            <div className="pt-4 mt-4 border-t border-border/20 space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground px-3 mb-3">Settings</h4>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 h-14 text-left rounded-xl hover:bg-accent/50 hover:scale-[1.02] transition-all duration-200"
                onClick={() => handleNavigate("/tools/theme")}
              >
                <span className="text-xl">🎨</span>
                <span className="font-semibold">Theme Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 h-14 text-left rounded-xl hover:bg-accent/50 hover:scale-[1.02] transition-all duration-200"
                onClick={() => handleNavigate("/tools/sounds")}
              >
                <span className="text-xl">🎧</span>
                <span className="font-semibold">Soundscapes</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 h-14 text-left rounded-xl hover:bg-accent/50 hover:scale-[1.02] transition-all duration-200"
                onClick={() => handleNavigate("/")}
              >
                <span className="text-xl">🏠</span>
                <span className="font-semibold">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}