"use client";

import { Presence } from "@/components/Presence";
import { AIComments } from "@/components/AIComments";
import { Editor } from "@/components/Editor";
import { ProjectProperties } from "@/components/ProjectProperties";
import { ProjectActions } from "@/components/ProjectActions";
import { Status } from "./Status";
import { useStorage, ClientSideSuspense } from "@liveblocks/react/suspense";
import Link from "next/link";

export function ProjectIssue({ projectId }: { projectId: string }) {
  return (
    <ClientSideSuspense fallback={<ProjectIssueFallback projectId={projectId} />}>
      <ProjectIssueContent projectId={projectId} />
    </ClientSideSuspense>
  );
}

function ProjectIssueContent({ projectId }: { projectId: string }) {
  const storage = useStorage((root) => root);

  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between border-b h-10 px-4 items-center">
        <div className="flex items-center gap-3">
          <Link 
            href="/projects"
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 transition-colors text-sm font-medium group"
            title="Back to Projects"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </Link>
          <Status />
        </div>
        <Presence />
      </header>
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                <Editor
                  storageFallback={storage}
                  contentFallback={
                    <div>
                      <h1>Project {projectId}</h1>
                      <p>Start editing your project documentation here...</p>
                    </div>
                  }
                />
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
              <ProjectProperties storageFallback={storage} projectId={projectId} />
            </div>

            <div>
              <div className="text-xs font-medium text-neutral-600 mb-0 h-10 flex items-center">
                Actions
              </div>
              <ProjectActions projectId={projectId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectIssueFallback({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between border-b h-10 px-4 items-center">
        <div className="flex items-center gap-3">
          <Link 
            href="/projects"
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 transition-colors text-sm font-medium group"
            title="Back to Projects"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </Link>
          <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
        </div>
        <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse" />
      </header>
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                <div className="h-8 bg-neutral-200 rounded w-48 mb-4 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="border-l flex-grow-0 flex-shrink-0 w-[200px] lg:w-[260px] px-4 flex flex-col gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-2 h-10 flex items-center">
                Properties
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 