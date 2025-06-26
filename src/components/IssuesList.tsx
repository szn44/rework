"use client";

import { LABELS, PRIORITY_STATES, PROJECTS, RoomWithMetadata } from "@/config";
import { DashIcon } from "@/icons/DashIcon";
import { ProgressInReviewIcon } from "@/icons/ProgressInReviewIcon";
import { ProgressInProgressIcon } from "@/icons/ProgressInProgressIcon";
import { ProgressTodoIcon } from "@/icons/ProgressTodoIcon";
import { ProgressDoneIcon } from "@/icons/ProgressDoneIcon";
import { CreateIssueButton } from "./CreateIssueButton";
import { StackedAvatars } from "./StackedAvatars";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useNavigation } from "./NavigationContext";
import { useWorkspace } from "./WorkspaceContext";
import { useSpace } from "./SpaceContext";
import { usePathname } from "next/navigation";

export function IssuesList({
  initialRooms,
  hideHeader = false,
}: {
  initialRooms: RoomWithMetadata[];
  hideHeader?: boolean;
}) {
  const rooms = initialRooms;

  // Use client-side metadata processing (simplified version)
  const roomsWithProgress = useMemo(() => {
    return rooms.map((room) => {
      const metadata = getMetadataFromRoom(room);
      return { ...room, actualProgress: metadata.progress };
    });
  }, [rooms]);

  // Filter based on actual progress values
  const inReview = useMemo(() => roomsWithProgress.filter((room) => room.actualProgress === "review"), [roomsWithProgress]);
  const inProgress = useMemo(() => roomsWithProgress.filter((room) => room.actualProgress === "progress"), [roomsWithProgress]);  
  const todo = useMemo(() => roomsWithProgress.filter((room) => room.actualProgress === "todo"), [roomsWithProgress]);
  const none = useMemo(() => roomsWithProgress.filter((room) => room.actualProgress === "none"), [roomsWithProgress]);
  const done = useMemo(() => roomsWithProgress.filter((room) => room.actualProgress === "done"), [roomsWithProgress]);

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900">Issues</h1>
            <div className="text-xs text-neutral-500">
              {rooms.length} issue{rooms.length !== 1 ? 's' : ''}
            </div>
          </div>
          <CreateIssueButton />
        </div>
      )}

      {/* Todo Section - Always show */}
      <div className="flex items-center gap-2 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
        <ProgressTodoIcon className="w-4 h-4 text-neutral-500" />
        <span>Todo</span>
        <span className="ml-auto text-xs text-neutral-500">
          {todo.length + none.length}
        </span>
      </div>
      {todo.map((room) => (
        <Row key={room.id} room={room} />
      ))}
      {none.map((room) => (
        <Row key={room.id} room={room} />
      ))}
      {(todo.length === 0 && none.length === 0) && (
        <EmptyStateRow progressType="todo" />
      )}

      {/* In Progress Section - Always show */}
      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
        <ProgressInProgressIcon className="w-4 h-4 text-yellow-500" />
        <span>In Progress</span>
        <span className="ml-auto text-xs text-neutral-500">
          {inProgress.length}
        </span>
      </div>
      {inProgress.map((room) => (
        <Row key={room.id} room={room} />
      ))}
      {inProgress.length === 0 && (
        <EmptyStateRow progressType="progress" />
      )}

      {/* In Review Section - Always show */}
      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
        <ProgressInReviewIcon className="w-4 h-4 text-emerald-500" />
        <span>In Review</span>
        <span className="ml-auto text-xs text-neutral-500">
          {inReview.length}
        </span>
      </div>
      {inReview.map((room) => (
        <Row key={room.id} room={room} />
      ))}
      {inReview.length === 0 && (
        <EmptyStateRow progressType="review" />
      )}

      {/* Done Section - Always show */}
      <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
        <ProgressDoneIcon className="w-4 h-4 text-indigo-500" />
        <span>Done</span>
        <span className="ml-auto text-xs text-neutral-500">
          {done.length}
        </span>
      </div>
      {done.map((room) => (
        <Row key={room.id} room={room} />
      ))}
      {done.length === 0 && (
        <EmptyStateRow progressType="done" />
      )}
    </div>
  );
}

export function Row({ room }: { room: RoomWithMetadata }) {
  const { navigateToIssue } = useNavigation();
  const { issueId, title, priority, progress, assignedTo, labels, project } =
    getMetadataFromRoom(room);

  // Handle both legacy single assignee and new multiple assignee format
  const assigneeIds = Array.isArray(assignedTo) ? assignedTo : (assignedTo && assignedTo !== "none" ? [assignedTo] : []);

  const date = (() => {
    const createdAt = room.createdAt;
    if (typeof createdAt === 'string') {
      return new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  })();

  const handleClick = () => {
    navigateToIssue(issueId, 'issues');
  };

  return (
    <button
      onClick={handleClick}
      className="group flex h-12 items-center justify-between px-4 text-sm transition-all duration-150 hover:bg-neutral-50 hover:shadow-sm border-b border-neutral-100 bg-white w-full text-left"
    >
      <div className="flex gap-3 items-center min-w-0 flex-1">
        <div className="w-5 flex-shrink-0">
          {PRIORITY_STATES.find((p) => p.id === priority)?.icon}
        </div>
        <div className="font-medium text-neutral-900 truncate group-hover:text-neutral-700 transition-colors">
          {title}
        </div>
      </div>
      <div className="flex gap-4 items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          {project && PROJECTS.find(p => p.id === project) && (
            <div className="text-xs rounded-full px-2 py-1 bg-blue-50 border border-blue-200 flex items-center gap-1.5 select-none text-blue-700">
              <div 
                className="rounded-full w-1.5 h-1.5" 
                style={{ backgroundColor: PROJECTS.find(p => p.id === project)?.color }}
              />
              {PROJECTS.find(p => p.id === project)?.name}
            </div>
          )}
          {LABELS.filter((label) => labels && labels.includes(label.id)).map(
            ({ id, text }) => (
              <div
                key={id}
                className="text-xs rounded-full px-2 py-1 bg-neutral-100 border border-neutral-200 flex items-center gap-1.5 select-none text-neutral-600"
              >
                <div className="bg-neutral-400 rounded-full w-1.5 h-1.5" />
                {text}
              </div>
            )
          )}
        </div>
        <div className="flex-none w-16 text-right text-xs text-neutral-500 font-medium">
          {date}
        </div>
        <div className="flex-shrink-0">
          <StackedAvatars assigneeIds={assigneeIds} maxVisible={3} />
        </div>
      </div>
    </button>
  );
}

function EmptyStateRow({ progressType }: { progressType: string }) {
  return (
    <div className="flex h-12 items-center justify-start px-4 text-sm border-b border-neutral-100 bg-white">
      <CreateIssueWithProgress progressType={progressType} />
    </div>
  );
}

function CreateIssueWithProgress({ progressType }: { progressType: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const { currentSpace } = useSpace();

  const handleCreateIssue = async () => {
    if (isCreating) return; // Prevent multiple clicks
    
    if (!currentWorkspace) {
      console.error("No current workspace selected");
      return;
    }

    // Only assign space if we're on a space page (not main issues page)
    const isOnSpacePage = pathname.startsWith('/spaces/');
    const spaceIdToAssign = isOnSpacePage ? (currentSpace?.id || null) : null;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workspace_id: currentWorkspace.id,
          space_id: spaceIdToAssign,
          status: progressType,
          title: 'Untitled'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.issueId) {
          // Redirect to the new issue
          window.location.href = `/issue/${result.issueId}`;
        }
      } else {
        const error = await response.json();
        console.error('Failed to create issue:', error);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex h-12 items-center justify-start px-4 text-sm border-b border-neutral-100 bg-white">
        <span className="text-neutral-400">No workspace selected</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateIssue}
      disabled={isCreating}
      className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <>
          <div className="w-3 h-3 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </>
      )}
    </button>
  );
}

function getMetadataFromRoom(room: RoomWithMetadata) {
  // Client-side version: use room metadata directly
  // Helper function to convert LiveList to array if needed
  const getAssigneeArray = (assignedTo: any) => {
    if (!assignedTo) return [];
    if (Array.isArray(assignedTo)) return assignedTo;
    if (assignedTo.toArray) return assignedTo.toArray(); // LiveList
    if (assignedTo === "none" || assignedTo === "" || assignedTo === "Todo") return [];
    return [assignedTo]; // Single value
  };

  return {
    issueId: room.metadata.issueId,
    title: room.metadata.title || "Untitled",
    progress: room.metadata.progress || "none",
    priority: room.metadata.priority || "none",
    assignedTo: getAssigneeArray(room.metadata.assignedTo) || [],
    labels: room.metadata.labels || [],
    project: room.metadata.project,
  };
}
