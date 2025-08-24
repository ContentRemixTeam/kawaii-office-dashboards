import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import TopControlBar from "./TopControlBar";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider 
      defaultOpen={false}
      className="min-h-screen"
    >
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Control Bar with Sidebar Trigger */}
          <div className="relative">
            <TopControlBar />
            
            {/* Sidebar trigger positioned on top of the control bar */}
            <SidebarTrigger className="
              fixed top-3 left-2 z-50 h-8 w-8 p-0 
              bg-primary text-primary-foreground shadow-lg 
              hover:bg-primary/90 hover:shadow-xl hover:scale-105
              transition-all duration-200 rounded-lg
              flex items-center justify-center
            ">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 w-full pt-16 pb-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}