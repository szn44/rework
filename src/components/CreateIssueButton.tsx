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
      <div className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white rounded-xl shadow-lg shadow-gray-500/25 dark:shadow-gray-500/20 flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold cursor-not-allowed opacity-60">
        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="relative z-10">No Workspace</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateIssue}
      disabled={isCreating}
      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25 disabled:shadow-none transition-all duration-300 ease-out transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
          <span className="relative z-10">Creating...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110 group-disabled:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative z-10">New Issue</span>
        </>
      )}
    </button>
  );
} 