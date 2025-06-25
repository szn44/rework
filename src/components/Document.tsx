"use client";

import { ClientSideSuspense, useStorage } from "@liveblocks/react/suspense";

type DocumentHeaderProps = {
  documentId: string;
  showTitle?: boolean;
};

export function DocumentHeader({ documentId, showTitle = true }: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm font-medium text-neutral-600">
        WiKi Document
      </div>
      {showTitle && (
        <ClientSideSuspense fallback={<div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />}>
          <DocumentTitle />
        </ClientSideSuspense>
      )}
    </div>
  );
}

export function DocumentHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
      <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
    </div>
  );
}

function DocumentTitle() {
  const title = useStorage((root) => root.meta.title);
  
  return (
    <div className="text-sm font-medium text-neutral-900 truncate">
      {title}
    </div>
  );
} 