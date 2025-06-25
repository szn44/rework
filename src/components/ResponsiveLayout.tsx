"use client";

import { ReactNode } from "react";
import { useAISidebar } from "./AISidebarContext";
import { useNavigation } from "./NavigationContext";
import { ResizableNav } from "./ResizableNav";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

function ResponsiveLayoutInner({ children, className = "" }: ResponsiveLayoutProps) {
  const { isOpen, width: aiSidebarWidth } = useAISidebar();
  
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <ResizableNav />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <ResponsiveLayoutInner className={className}>
      {children}
    </ResponsiveLayoutInner>
  );
} 