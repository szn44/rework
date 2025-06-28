"use client";

import { LABELS, PRIORITY_STATES, PROJECTS, IssueItem } from "@/config";
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
  initialIssues,
  hideHeader = false,
}: {
  initialIssues: IssueItem[];
  hideHeader?: boolean;
}) {
  const issues = initialIssues;

  // Filter based on issue progress values
  const inReview = useMemo(() => issues.filter((item) => item.metadata.progress === "review"), [issues]);
  const inProgress = useMemo(() => issues.filter((item) => item.metadata.progress === "progress"), [issues]);  
  const todo = useMemo(() => issues.filter((item) => item.metadata.progress === "todo"), [issues]);
  const none = useMemo(() => issues.filter((item) => item.metadata.progress === "none"), [issues]);
  const done = useMemo(() => issues.filter((item) => item.metadata.progress === "done"), [issues]);

  return (
    <div className="bg-white dark:bg-dark-bg-primary">
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 text-sm border-b dark:border-dark-bg-tertiary h-12 bg-white dark:bg-dark-bg-primary">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900 dark:text-dark-text-primary">Issues</h1>
            <div className="text-xs text-neutral-500 dark:text-dark-text-secondary">
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </div>
          </div>
          <CreateIssueButton />
        </div>
      )}

      {/* Todo Section - Always show */}
      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-dark-bg-secondary px-4 py-2 text-sm font-medium text-neutral-800 dark:text-dark-text-primary w-full border-b dark:border-dark-bg-tertiary">
        <ProgressTodoIcon className="w-4 h-4 text-neutral-500 dark:text-dark-text-secondary" />
        <span>Todo</span>
        <span className="ml-auto text-xs text-neutral-500 dark:text-dark-text-secondary">
          {todo.length + none.length}
        </span>
      </div>
      {todo.map((issue) => (
        <Row key={issue.issue.id} issue={issue} />
      ))}
      {none.map((issue) => (
        <Row key={issue.issue.id} issue={issue} />
      ))}
      {(todo.length === 0 && none.length === 0) && (
        <EmptyStateRow progressType="todo" />
      )}

      {/* In Progress Section - Always show */}
      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-dark-text-primary w-full border-b dark:border-dark-bg-tertiary">
        <ProgressInProgressIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
        <span>In Progress</span>
        <span className="ml-auto text-xs text-neutral-500 dark:text-dark-text-secondary">
          {inProgress.length}
        </span>
      </div>
      {inProgress.map((issue) => (
        <Row key={issue.issue.id} issue={issue} />
      ))}
      {inProgress.length === 0 && (
        <EmptyStateRow progressType="progress" />
      )}

      {/* In Review Section - Always show */}
      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-dark-text-primary w-full border-b dark:border-dark-bg-tertiary">
        <ProgressInReviewIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        <span>In Review</span>
        <span className="ml-auto text-xs text-neutral-500 dark:text-dark-text-secondary">
          {inReview.length}
        </span>
      </div>
      {inReview.map((issue) => (
        <Row key={issue.issue.id} issue={issue} />
      ))}
      {inReview.length === 0 && (
        <EmptyStateRow progressType="review" />
      )}

      {/* Done Section - Always show */}
      <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-dark-text-primary w-full border-b dark:border-dark-bg-tertiary">
        <ProgressDoneIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        <span>Done</span>
        <span className="ml-auto text-xs text-neutral-500 dark:text-dark-text-secondary">
          {done.length}
        </span>
      </div>
      {done.map((issue) => (
        <Row key={issue.issue.id} issue={issue} />
      ))}
      {done.length === 0 && (
        <EmptyStateRow progressType="done" />
      )}
    </div>
  );
}

export function Row({ issue }: { issue: IssueItem }) {
  const { navigateToIssue } = useNavigation();
  const { issueId, title, priority, progress, assignedTo, labels, project } = issue.metadata;

  // Handle both legacy single assignee and new multiple assignee format
  const assigneeIds = Array.isArray(assignedTo) 
    ? assignedTo 
    : (typeof assignedTo === 'string' && assignedTo !== "none" && assignedTo !== "" 
       ? assignedTo.split(',').filter(Boolean) 
       : []);

  const date = (() => {
    const createdAt = issue.issue.created_at;
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
      className="group flex h-12 items-center justify-between px-4 text-sm transition-all duration-150 hover:bg-neutral-50 dark:hover:bg-dark-bg-secondary hover:shadow-sm border-b border-neutral-100 dark:border-dark-bg-tertiary bg-white dark:bg-dark-bg-primary w-full text-left"
    >
      <div className="flex gap-3 items-center min-w-0 flex-1">
        <div className="w-5 flex-shrink-0">
          {PRIORITY_STATES.find((p) => p.id === priority)?.icon}
        </div>
        <div className="font-medium text-neutral-900 dark:text-dark-text-primary truncate group-hover:text-neutral-700 dark:group-hover:text-dark-text-secondary transition-colors">
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
        <div className="flex-none w-16 text-right text-xs text-neutral-500 dark:text-dark-text-secondary font-medium">
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
    <div className="flex h-12 items-center justify-start px-4 text-sm border-b border-neutral-100 dark:border-dark-bg-tertiary bg-white dark:bg-dark-bg-primary">
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
      <div className="flex h-12 items-center justify-start px-4 text-sm border-b border-neutral-100 dark:border-dark-bg-tertiary bg-white dark:bg-dark-bg-primary">
        <span className="text-neutral-400 dark:text-dark-text-tertiary">No workspace selected</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateIssue}
      disabled={isCreating}
      className="flex items-center gap-2 text-neutral-500 dark:text-dark-text-secondary hover:text-neutral-700 dark:hover:text-dark-text-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

