"use client";

import Link from "next/link";

export function ProjectActions({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/projects`}
        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Projects
      </Link>
      
      <button
        onClick={() => {
          // TODO: Implement project archiving
          console.log("Archive project:", projectId);
        }}
        className="text-sm text-neutral-600 hover:text-red-600 transition-colors flex items-center gap-2 text-left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Archive Project
      </button>

      <button
        onClick={() => {
          // TODO: Implement project sharing
          console.log("Share project:", projectId);
        }}
        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2 text-left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        Share Project
      </button>

      <button
        onClick={() => {
          // TODO: Implement project export
          console.log("Export project:", projectId);
        }}
        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2 text-left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Project
      </button>
    </div>
  );
} 