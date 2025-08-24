import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, X } from "lucide-react";
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
          size="icon"
          className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[80vh]">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <h3 className="text-lg font-semibold text-foreground">🛠️ Toolkit</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 text-left rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-soft" 
                      : "hover:bg-accent/50 hover:scale-[1.02]"
                  }`}
                  onClick={() => handleNavigate(item.href)}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
            
            {/* Additional navigation items */}
            <div className="pt-4 mt-4 border-t border-border/20">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-left rounded-xl hover:bg-accent/50 hover:scale-[1.02] transition-all duration-200"
                onClick={() => handleNavigate("/")}
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}