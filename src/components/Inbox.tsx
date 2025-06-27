"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { IssueWithRelations } from "@/config";
import classNames from "classnames";
import { CheckCheckIcon } from "@/icons/CheckCheckIcon";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'backlog':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
          {issue.title || 'Untitled'}
        </h3>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">
          {issue.workspace_slug}-{issue.issue_number}
        </span>
        {issue.spaces && (
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: `${issue.spaces.color}20`, color: issue.spaces.color }}
          >
            {issue.spaces.name}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
          {issue.status?.replace('_', ' ') || 'No Status'}
        </span>
        {issue.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Updated {new Date(issue.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
