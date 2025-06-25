"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type ViewType = "list" | "board";

interface NavigationContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isHydrated: boolean;
  navigateToIssue: (issueId: string, context?: string) => void;
  goBack: () => void;
  context: string | null;
  setContext: (context: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentViewState] = useState<ViewType>("list");
  const [isHydrated, setIsHydrated] = useState(false);
  const [context, setContext] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize view state after hydration
  useEffect(() => {
    // Get view from URL params first, then localStorage
    const urlView = searchParams.get('view') as ViewType;
    if (urlView === 'list' || urlView === 'board') {
      setCurrentViewState(urlView);
    } else {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('issuesView') as ViewType;
        if (saved === 'list' || saved === 'board') {
          setCurrentViewState(saved);
        }
      } catch (error) {
        // localStorage might not be available during SSR
        console.log('localStorage not available during SSR');
      }
    }
    
    // Mark as hydrated after a brief delay to ensure stability
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams]);

  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    
    // Save to localStorage
    try {
      localStorage.setItem('issuesView', view);
    } catch (error) {
      console.log('Failed to save view to localStorage');
    }
    
    // Update URL if we're on the issues page
    if (pathname === '/') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', view);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const navigateToIssue = useCallback((issueId: string, navigationContext?: string) => {
    const contextToUse = navigationContext || context || 'issues';
    router.push(`/issue/${issueId}?context=${encodeURIComponent(contextToUse)}`);
  }, [router, context]);

  const goBack = useCallback(() => {
    const urlContext = searchParams.get('context');
    
    if (urlContext) {
      // If we have a context, navigate back based on it
      if (urlContext.startsWith('space-')) {
        const spaceId = urlContext.replace('space-', '');
        router.push(`/spaces/${spaceId}`);
      } else if (urlContext === 'kanban') {
        router.push('/?view=board');
      } else {
        router.push('/');
      }
    } else {
      // Default fallback - try browser back, or go to issues
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    }
  }, [router, searchParams]);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        setCurrentView,
        isHydrated,
        navigateToIssue,
        goBack,
        context,
        setContext,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
} 