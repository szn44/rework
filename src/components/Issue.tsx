"use client";

import { Presence } from "@/components/Presence";
import { AIComments } from "@/components/AIComments";
import { Editor } from "@/components/Editor";
import { IssueProperties } from "@/components/IssueProperties";
import { IssueLabels } from "@/components/IssueLabels";
import { IssueProject } from "@/components/IssueProject";
import { IssueActions } from "@/components/IssueActions";
import { IssueLinks } from "@/components/IssueLinks";
import { IssueHeader } from "./IssueHeader";
import { useIssue } from "@/app/IssueProvider";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function Issue({ issueId }: { issueId: string }) {
  const { issue, loading, error } = useIssue();

  if (error) {
    return (
      <div className="max-w-[840px] mx-auto pt-20">
        <h1 className="outline-none block w-full text-2xl font-bold bg-transparent my-6">
          Issue not found
        </h1>
        <div className="space-y-4">
          <p>
            This issue may have been deleted or is still being created.
          </p>
          <div className="flex gap-3">
            <a className="font-bold underline text-blue-600 hover:text-blue-800" href="/">
              ← Back to issue list
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !issue) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  // Convert database content to HTML for display
  const getContentHtml = () => {
    if (!issue.content_text) return "<p></p>";
    
    try {
      // Simple markdown conversion for display
      const markdown = issue.content_text
        .replace(/\n{2,}/g, (match) => "<p><br></p>".repeat(match.length - 1))
        .replace(/\n(?!$)/g, "\n\n")
        .replace(/(\n+)$/g, (match) => "<p><br></p>".repeat(match.length));

      const sanitized = sanitizeHtml(markdown, {
        allowedTags: ["p", "br"],
        disallowedTagsMode: "escape",
      });

      return marked(sanitized);
    } catch (err) {
      return "<p></p>";
    }
  };

  // Create storage fallback object that mimics Liveblocks storage structure
  const storageFallback = {
    meta: {
      title: issue.title || "Untitled issue"
    },
    properties: {
      progress: issue.status || "none",
      priority: issue.priority || "none",
      assignedTo: issue.assignee_ids || [],
    },
    labels: [], // TODO: Implement labels
    links: [], // TODO: Implement links
    space: issue.space_id,
    project: issue.space_id,
  };

  // Create room metadata fallback
  const roomMetadata = {
    title: issue.title,
    status: issue.status,
    priority: issue.priority,
    assignee_ids: issue.assignee_ids,
    space_id: issue.space_id,
  };

  return (
    <div className="h-full flex flex-col">
      <IssueHeader />
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                <Editor
                  storageFallback={storageFallback}
                  contentFallback={
                    <div dangerouslySetInnerHTML={{ __html: getContentHtml() }} />
                  }
                />
                <div className="my-6">
                  <IssueLinks storageFallback={storageFallback} />
                </div>
                <div className="border-t my-6" />
                <AIComments />
              </div>
            </div>
          </div>
          <div className="border-l flex-grow-0 flex-shrink-0 w-[200px] lg:w-[260px] px-4 flex flex-col gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-2 h-10 flex items-center">
                Properties
              </div>
              <IssueProperties storageFallback={storageFallback} roomMetadata={roomMetadata} />
            </div>

            <div>
              <div className="text-xs font-medium text-neutral-600 mb-0 h-10 flex items-center">
                Labels
              </div>
              <IssueLabels storageFallback={storageFallback} />
            </div>

            <div>
              <div className="text-xs font-medium text-neutral-600 mb-0 h-10 flex items-center">
                Space
              </div>
              <IssueProject storageFallback={storageFallback} />
            </div>

            <div>
              <div className="text-xs font-medium text-neutral-600 mb-0 h-10 flex items-center">
                Actions
              </div>
              <IssueActions issueId={issueId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
