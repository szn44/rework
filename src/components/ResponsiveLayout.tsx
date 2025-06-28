"use client";

import { ReactNode } from "react";
import { useAISidebar } from "./AISidebarContext";
import { useNavigation } from "./NavigationContext";
import { ResizableNav } from "./ResizableNav";
import { User } from "@supabase/supabase-js";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  user?: User;
}

function ResponsiveLayoutInner({ children, className = "", user }: ResponsiveLayoutProps) {
  const { isOpen, width: aiSidebarWidth } = useAISidebar();
  
  return (
    <div className="flex h-screen bg-neutral-200/50 dark:bg-dark-bg-nav overflow-hidden">
      {/* Navigation */}
      <ResizableNav user={user} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ResponsiveLayout({ children, className, user }: ResponsiveLayoutProps) {
  return (
    <ResponsiveLayoutInner className={className} user={user}>
      {children}
    </ResponsiveLayoutInner>
  );
} 