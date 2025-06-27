"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { IssueWithRelations, PRIORITY_STATES, PROJECTS } from "@/config";
import classNames from "classnames";
import { CheckCheckIcon } from "@/icons/CheckCheckIcon";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { StackedAvatars } from "./StackedAvatars";

interface InboxProps {
  onIssueSelect?: (issueId: string) => void;
}

export function Inbox({ onIssueSelect }: InboxProps) {
  const [assignedIssues, setAssignedIssues] = useState<IssueWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    async function loadAssignedIssues() {
      if (!currentWorkspace) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Get issues assigned to current user
        const { data: issues, error: issuesError } = await supabase
          .from("issues")
          .select(`
            id,
            workspace_slug,
            issue_number,
            title,
            status,
            priority,
            assignee_ids,
            created_at,
            updated_at,
            workspaces (
              name,
              slug
            ),
            spaces (
              slug,
              name,
              color
            )
          `)
          .eq("workspace_slug", currentWorkspace.slug)
          .contains("assignee_ids", [user.id])
          .order("updated_at", { ascending: false });

        if (issuesError) {
          console.error("Error loading assigned issues:", issuesError);
          setError("Failed to load assigned issues");
        } else {
          setAssignedIssues(issues || []);
        }
      } catch (err) {
        console.error("Error loading assigned issues:", err);
        setError("Failed to load assigned issues");
      } finally {
        setLoading(false);
      }
    }

    loadAssignedIssues();
  }, [currentWorkspace]);

  const handleIssueClick = (issue: IssueWithRelations) => {
    const issueId = `${issue.workspace_slug}-${issue.issue_number}`;
    if (onIssueSelect) {
      onIssueSelect(issueId);
    } else {
      router.push(`/issue/${issueId}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900">Inbox</h1>
            <div className="text-xs text-neutral-500">
              {assignedIssues.length} assigned issues
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-neutral-500">Loading assigned issues...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        ) : assignedIssues.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-neutral-500">No assigned issues</div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {assignedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => handleIssueClick(issue)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface IssueCardProps {
  issue: IssueWithRelations;
  onClick: () => void;
}

function IssueCard({ issue, onClick }: IssueCardProps) {
  const date = (() => {
    const updatedAt = issue.updated_at;
    if (typeof updatedAt === 'string') {
      return new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (updatedAt instanceof Date) {
      return updatedAt.toLocaleDateString("en-US", {
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

  const priorityState = PRIORITY_STATES.find((p) => p.id === issue.priority);
  const project = PROJECTS.find(p => p.id === issue.workspace_slug);

  const cardStyle = {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.06)',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      style={cardStyle}
      className="group relative bg-white rounded-xl border-0 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1"
    >
      <button
        onClick={handleCardClick}
        className="block p-3.5 space-y-3 w-full text-left"
      >
        {/* Header with Priority and ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {priorityState && (
              <div className="flex-shrink-0 w-3.5 h-3.5 opacity-70">
                {priorityState.icon}
              </div>
            )}
            <span className="text-xs font-mono text-gray-500 tracking-wide font-medium">
              {issue.workspace_slug}-{issue.issue_number}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{date}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {issue.title || 'Untitled'}
        </h3>

        {/* Labels and Project */}
        <div className="flex flex-wrap gap-1.5">
          {project && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50/80 border border-blue-100 rounded-md text-xs font-medium text-blue-700">
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </div>
          )}
          {issue.spaces && (
            <div 
              className="inline-flex items-center gap-1 px-2 py-0.5 border rounded-md text-xs font-medium"
              style={{ 
                backgroundColor: `${issue.spaces.color}20`, 
                borderColor: `${issue.spaces.color}40`,
                color: issue.spaces.color 
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: issue.spaces.color }}
              />
              {issue.spaces.name}
            </div>
          )}
          {issue.status && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50/80 border border-gray-100 rounded-md text-xs font-medium text-gray-600">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              {issue.status.replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Footer with Assignees */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex-shrink-0">
            <StackedAvatars 
              assigneeIds={issue.assignee_ids || []} 
              maxVisible={3} 
              size="sm"
            />
          </div>
          
          {/* Hover Effect Indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
