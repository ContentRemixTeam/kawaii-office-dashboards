import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS } from "@/data/nav";
import { readEarnedAnimals } from "@/lib/topbarState";
import { onChanged } from "@/lib/bus";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [earnedAnimals, setEarnedAnimals] = useState<Array<{ id: string; emoji: string }>>([]);
  
  // Load earned animals
  useEffect(() => {
    setEarnedAnimals(readEarnedAnimals());
    
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_earned_animals_v1")) {
        setEarnedAnimals(readEarnedAnimals());
      }
    });
    
    return unsubscribe;
  }, []);
  
  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href;
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <Sidebar 
      className={`
        bg-card/95 backdrop-blur-sm border-r border-border/20 
        transition-all duration-300 ease-in-out shadow-lg
        ${isCollapsed ? "w-16" : "w-64"}
      `}
      collapsible="icon"
    >
      <SidebarContent className="gap-0 pt-16 py-4">
        {/* Expand hint when collapsed */}
        {isCollapsed && (
          <div className="px-2 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-8 w-12 mx-auto bg-primary/10 rounded-lg border border-primary/20 animate-pulse cursor-pointer">
                  <span className="text-xs text-primary font-semibold">⏷</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-primary text-primary-foreground">
                Click the menu button to expand sidebar
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {/* Home Button at Top */}
        <SidebarMenu className="mb-4 px-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className={`
                group relative h-12 transition-all duration-200 hover:scale-[1.02] rounded-xl
                ${isActive("/") 
                  ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 ring-2 ring-primary/20" 
                  : "hover:bg-accent/50 hover:shadow-sm hover:border-primary/20"
                }
                ${isCollapsed ? "justify-center px-2" : "justify-start px-3"}
              `}
            >
              <button
                onClick={() => handleNavigate("/")}
                className="flex items-center w-full gap-3"
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">
                    Office
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive("/") && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                )}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Divider */}
        <div className="mx-4 mb-6 border-t border-border/20" />
        
        {/* Navigation Items */}
        <SidebarMenu className="gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            
            const menuButton = (
              <SidebarMenuButton 
                asChild
                className={`
                  group relative h-12 transition-all duration-200 hover:scale-[1.02] mx-2 rounded-xl
                  ${active 
                    ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 ring-2 ring-primary/20" 
                    : "hover:bg-accent/50 hover:shadow-sm hover:border-primary/20"
                  }
                  ${isCollapsed ? "justify-center px-2" : "justify-start px-3"}
                `}
              >
                <button
                  onClick={() => handleNavigate(item.href)}
                  className="flex items-center w-full gap-3"
                >
                  <span 
                    className={`
                      text-lg transition-transform duration-200 flex-shrink-0
                      ${active ? "" : "group-hover:scale-110 group-hover:rotate-3"}
                    `}
                  >
                    {item.emoji}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                  )}
                </button>
              </SidebarMenuButton>
            );

            // Wrap in tooltip when collapsed
            if (isCollapsed) {
              return (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {menuButton}
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="font-medium"
                      sideOffset={8}
                    >
                      <span className="mr-2">{item.emoji}</span>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.href}>
                {menuButton}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

{/* Earned Animals Section */}
{earnedAnimals.length > 0 && (
  <SidebarGroup className="border-t border-border/10 pt-6">
    {!isCollapsed && (
      <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
        <span className="mr-2">🏆</span>
        Today's Pets
      </SidebarGroupLabel>
    )}
    
    <SidebarGroupContent>
      <div className={`mx-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 ${
        isCollapsed ? "flex justify-center" : ""
      }`}>
        <div className={`flex gap-2 ${isCollapsed ? "flex-col items-center" : "flex-wrap"}`}>
          {earnedAnimals.map((animal, index) => (
            <Tooltip key={`${animal.id}-${index}`}>
              <TooltipTrigger asChild>
                <div className="text-2xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                  {animal.emoji}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Earned {animal.id}!
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </SidebarGroupContent>
  </SidebarGroup>
)}
      </SidebarContent>
    </Sidebar>
  );
}