"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateIssueButton() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateIssue = async () => {
    if (isCreating) return; // Prevent double-clicks
    
    setIsCreating(true);
    try {
      // Generate issue ID on client side
      const { nanoid } = await import("nanoid");
      const issueId = nanoid();
      
      // Use API route instead of server action to avoid redirect issues
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          issueId,
          progress: 'none' 
        }),
      });

      if (response.ok) {
        // Navigate on client side instead of server redirect
        router.push(`/issue/${issueId}`);
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
      className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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