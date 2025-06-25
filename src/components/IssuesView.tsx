"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ViewSwitcher, ViewType } from "./ViewSwitcher";
import { IssuesList } from "./IssuesList";
import { KanbanBoard } from "./KanbanBoard";
import { CreateIssueButton } from "./CreateIssueButton";
import { RoomWithMetadata } from "@/config";
import { useNavigation } from "./NavigationContext";

interface IssuesViewProps {
  initialRooms: RoomWithMetadata[];
}

// Helper function to get metadata from room (simplified for client-side)
function getMetadataFromRoom(room: RoomWithMetadata) {
  // Use room metadata directly since we're on client side
  const assignedTo = Array.isArray(room.metadata.assignedTo) 
    ? room.metadata.assignedTo 
    : (room.metadata.assignedTo && room.metadata.assignedTo !== "none" ? [room.metadata.assignedTo] : []);

  return {
    issueId: room.metadata.issueId,
    title: room.metadata.title || "Untitled",
    progress: room.metadata.progress || "none",
    priority: room.metadata.priority || "none",
    assignedTo,
    labels: room.metadata.labels || [],
    project: room.metadata.project,
  };
}

export function IssuesView({ initialRooms }: IssuesViewProps) {
  const { currentView, setCurrentView } = useNavigation();

  // Convert rooms to board items format
  const boardItems = useMemo(() => {
    return initialRooms.map(room => ({
      room,
      metadata: getMetadataFromRoom(room),
    }));
  }, [initialRooms]);

  // Handle progress change from drag & drop
  const handleProgressChange = async (roomId: string, newProgress: string) => {
    console.log('🔥 DRAG & DROP: Starting progress update');
    console.log('🔥 DRAG & DROP: roomId received:', roomId);
    console.log('🔥 DRAG & DROP: newProgress:', newProgress);
    
    try {
      const payload = {
        roomId,
        metadata: {
          progress: newProgress,
        },
      };
      
      console.log('🔥 DRAG & DROP: Sending API request with payload:', payload);
      
      // Update the metadata (what the kanban board reads from)
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
      console.log('🔥 DRAG & DROP: API SUCCESS - metadata updated:', responseData);
      

      
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900">Issues</h1>
            <div className="text-xs text-neutral-500">
              {initialRooms.length} issue{initialRooms.length !== 1 ? 's' : ''}
            </div>
          </div>
          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
        </div>
        <CreateIssueButton />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {currentView === "list" ? (
          <div className="h-full overflow-y-auto">
            <IssuesList initialRooms={initialRooms} hideHeader={true} />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <KanbanBoard
              items={boardItems}
              type="issue"
              onProgressChange={handleProgressChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 