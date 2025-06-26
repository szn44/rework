"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from './WorkspaceContext';

interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  loading: boolean;
  error: string | null;
  refreshSpaces: () => void;
  setCurrentSpace: (space: Space | null) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const fetchSpaces = async () => {
    if (!currentWorkspace) {
      setSpaces([]);
      setCurrentSpace(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/spaces?workspace_id=${currentWorkspace.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const data = await response.json();
      setSpaces(data.spaces || []);
      
      // Set default space if none selected
      if (!currentSpace && data.spaces && data.spaces.length > 0) {
        const generalSpace = data.spaces.find((space: Space) => space.slug === 'general');
        setCurrentSpace(generalSpace || data.spaces[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [currentWorkspace]);

  const refreshSpaces = () => {
    fetchSpaces();
  };

  const value: SpaceContextType = {
    spaces,
    currentSpace,
    loading,
    error,
    refreshSpaces,
    setCurrentSpace,
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
} 