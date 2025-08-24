import React from "react";
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
import { NAV_SECTIONS } from "@/data/nav";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href;
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const HomeButton = () => {
    const active = isActive("/");
    
    const button = (
      <SidebarMenuButton 
        asChild
        className={`
          group relative h-12 transition-all duration-200 hover:scale-[1.02] mx-2 rounded-xl mb-4
          ${active 
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
          <span 
            className={`
              text-lg transition-transform duration-200 flex-shrink-0
              ${active ? "" : "group-hover:scale-110 group-hover:rotate-3"}
            `}
          >
            🏠
          </span>
          {!isCollapsed && (
            <span className="font-medium text-sm truncate">
              Home
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
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="font-medium"
            sideOffset={8}
          >
            <span className="mr-2">🏠</span>
            Home
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
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
      <SidebarContent className="gap-0 py-4">
        {/* Home Button at Top */}
        <div className="px-2">
          <HomeButton />
        </div>
        
        {/* Divider */}
        <div className="mx-4 mb-6 border-t border-border/20" />
        
        {NAV_SECTIONS.map((section, sectionIndex) => {
          const hasActiveItem = section.items.some(item => isActive(item.href));
          
          return (
            <SidebarGroup 
              key={section.title}
              className={`
                ${sectionIndex > 0 ? "border-t border-border/10 pt-6" : ""}
                mb-4
              `}
            >
              {!isCollapsed && (
                <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  <span className="mr-2">{section.emoji}</span>
                  {section.title}
                </SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {section.items.map((item) => {
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
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}