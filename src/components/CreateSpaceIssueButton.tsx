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
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </>
      )}
    </button>
  );
} 