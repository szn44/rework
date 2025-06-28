"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWorkspace } from "./WorkspaceContext";
import { useSpace } from "./SpaceContext";

export function CreateIssueButton() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const { currentSpace } = useSpace();

  const handleCreateIssue = async () => {
    console.log("CreateIssueButton clicked");
    console.log("Current workspace:", currentWorkspace);
    console.log("Current space:", currentSpace);
    console.log("Current pathname:", pathname);
    
    if (isCreating) return; // Prevent double-clicks
    
    if (!currentWorkspace) {
      console.error("No current workspace selected");
      return;
    }

    // Only assign space if we're on a space page (not main issues page)
    const isOnSpacePage = pathname.startsWith('/spaces/');
    const spaceIdToAssign = isOnSpacePage ? (currentSpace?.id || null) : null;
    
    console.log("Is on space page:", isOnSpacePage);
    console.log("Space ID to assign:", spaceIdToAssign);
    
    setIsCreating(true);
    try {
      console.log("Making API request to create issue...");
      // Use API route with proper workspace_id and space_id
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workspace_id: currentWorkspace.id,
          space_id: spaceIdToAssign,
          status: 'todo',
          title: 'Untitled'
        }),
      });

      console.log("API response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("API response result:", result);
        if (result.issueId) {
          // Navigate to the new issue
          console.log("Navigating to issue:", result.issueId);
          router.push(`/issue/${result.issueId}`);
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

  if (!currentWorkspace) {
    return (
      <div className="bg-gray-300 dark:bg-dark-bg-tertiary text-gray-500 dark:text-dark-text-tertiary rounded-lg px-3 py-2 text-sm font-medium cursor-not-allowed">
        No Workspace
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateIssue}
      disabled={isCreating}
      className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Issue
        </>
      )}
    </button>
  );
} 