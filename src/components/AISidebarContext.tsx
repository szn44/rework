"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AISidebarContextType {
  isOpen: boolean;
  isMinimized: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
  setIsOpen: (open: boolean) => void;
  setIsMinimized: (minimized: boolean) => void;
  setWidth: (width: number) => void;
  toggleOpen: () => void;
  toggleMinimized: () => void;
}

const AISidebarContext = createContext<AISidebarContextType | undefined>(undefined);

export function AISidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // Start with chat closed
  const [isMinimized, setIsMinimized] = useState(false);
  const [width, setWidth] = useState(320); // Default width in pixels
  
  const minWidth = 280;
  const maxWidth = 600;

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleMinimized = () => setIsMinimized(!isMinimized);

  return (
    <AISidebarContext.Provider
      value={{
        isOpen,
        isMinimized,
        width,
        minWidth,
        maxWidth,
        setIsOpen,
        setIsMinimized,
        setWidth,
        toggleOpen,
        toggleMinimized,
      }}
    >
      {children}
    </AISidebarContext.Provider>
  );
}

export function useAISidebar() {
  const context = useContext(AISidebarContext);
  if (context === undefined) {
    throw new Error("useAISidebar must be used within an AISidebarProvider");
  }
  return context;
} 