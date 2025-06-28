"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigation } from "./NavigationContext";
import { useWorkspace } from "./WorkspaceContext";
import { useSpace } from "./SpaceContext";

interface CreateSpaceIssueButtonProps {
  spaceId: string;
}

export function CreateSpaceIssueButton({ spaceId }: CreateSpaceIssueButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { navigateToIssue } = useNavigation();
  const { currentWorkspace } = useWorkspace();
  const { currentSpace } = useSpace();

  const handleCreateIssue = async () => {
    if (isCreating) return; // Prevent double-clicks
    
    if (!currentWorkspace) {
      console.error("No current workspace selected");
      return;
    }
    
    setIsCreating(true);
    try {
      // Create issue via API with space assignment
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workspace_id: currentWorkspace.id,
          space_id: currentSpace?.id || null,
          status: 'todo',
          title: 'Untitled'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.issueId) {
          // Navigate to the new issue with proper context
          navigateToIssue(result.issueId, `space-${spaceId}`);
        }
      } else {
        const error = await response.json();
        console.error('Failed to create issue:', error);
      }
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateIssue}
      disabled={isCreating}
      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25 disabled:shadow-none transition-all duration-300 ease-out transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2.5 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
          <span className="relative z-10">Creating...</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110 group-disabled:scale-100" />
          <span className="relative z-10">Add Task</span>
        </>
      )}
    </button>
  );
} 