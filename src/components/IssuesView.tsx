"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ViewSwitcher, ViewType } from "./ViewSwitcher";
import { IssuesList } from "./IssuesList";
import { KanbanBoard } from "./KanbanBoard";
import { CreateIssueButton } from "./CreateIssueButton";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { IssueItem } from "@/config";
import { useNavigation } from "./NavigationContext";

interface IssuesViewProps {
  initialIssues: IssueItem[];
}

export function IssuesView({ initialIssues }: IssuesViewProps) {
  const { currentView, setCurrentView } = useNavigation();

  // Handle progress change from drag & drop
  const handleProgressChange = async (issueId: string, newProgress: string) => {
    console.log('🔥 DRAG & DROP: Starting progress update');
    console.log('🔥 DRAG & DROP: issueId received:', issueId);
    console.log('🔥 DRAG & DROP: newProgress:', newProgress);
    
    try {
      const payload = {
        issueId,
        status: newProgress,
      };
      
      console.log('🔥 DRAG & DROP: Sending API request with payload:', payload);
      
      // Update the issue status directly in database
      const response = await fetch('/api/update-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('🔥 DRAG & DROP: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 DRAG & DROP: API ERROR:', response.status, errorText);
        // Force reload even on error to check current state
        window.location.reload();
        return;
      }
      
      const responseData = await response.json();
      console.log('🔥 DRAG & DROP: API SUCCESS - status updated:', responseData);
      
      // Force immediate page refresh to show changes
      console.log('🔥 DRAG & DROP: Forcing page reload...');
      window.location.reload();
      
    } catch (error) {
      console.error('🔥 DRAG & DROP: EXCEPTION:', error);
      console.log('🔥 DRAG & DROP: Forcing page reload due to exception...');
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-dark-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 text-sm border-b dark:border-dark-bg-tertiary h-12 bg-white dark:bg-dark-bg-primary flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900 dark:text-dark-text-primary">Issues</h1>
            <div className="text-xs text-neutral-500 dark:text-dark-text-secondary">
              {initialIssues.length} issue{initialIssues.length !== 1 ? 's' : ''}
            </div>
          </div>
          <WorkspaceSelector />
          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
        </div>
        <CreateIssueButton />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-gray-50 dark:bg-dark-bg-primary">
        {currentView === "list" ? (
          <div className="h-full overflow-y-auto">
            <IssuesList initialIssues={initialIssues} hideHeader={true} />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <KanbanBoard
              items={initialIssues}
              type="issue"
              onProgressChange={handleProgressChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 