"use client";

import { useThreads, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ThreadData } from "@liveblocks/client";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useState } from "react";
import { AIComposer } from "./AIComposer";
import { AIThread } from "./AIThread";

export function AIComments() {
  return (
    <>
      <div className="font-medium">AI Comments</div>
      <ClientSideSuspense
        fallback={
          <>
            <div className="bg-gray-100/80 animate-pulse h-[130px] rounded-lg my-6" />
          </>
        }
      >
        <AIThreadList />
        <AIComposer className="border border-neutral-200 !my-4 rounded-lg overflow-hidden shadow-sm bg-white" />
      </ClientSideSuspense>
    </>
  );
}

function AIThreadList() {
  const { threads } = useThreads();

  if (threads.length === 0) {
    return null;
  }

  return (
    <div className="">
      {threads.map((thread) => (
        <AIThread key={thread.id} thread={thread} />
      ))}
    </div>
  );
} 