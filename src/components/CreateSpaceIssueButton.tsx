"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigation } from "./NavigationContext";

interface CreateSpaceIssueButtonProps {
  spaceId: string;
}

export function CreateSpaceIssueButton({ spaceId }: CreateSpaceIssueButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { navigateToIssue } = useNavigation();

  const handleCreateIssue = async () => {
    if (isCreating) return; // Prevent double-clicks
    
    setIsCreating(true);
    try {
      // Generate issue ID on client side
      const { nanoid } = await import("nanoid");
      const issueId = nanoid();
      
      // Create issue via API with space assignment
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          issueId,
          progress: 'todo', // Default to todo for space issues
          space: spaceId,
          project: spaceId, // For backward compatibility
        }),
      });

      if (response.ok) {
        // Navigate to the new issue with proper context
        navigateToIssue(issueId, `space-${spaceId}`);
      } else {
        console.error('Failed to create issue:', response.statusText);
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