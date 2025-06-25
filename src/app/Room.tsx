"use client";

import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { ReactNode, useEffect, useState } from "react";
import { getRoomId } from "@/config";

export function Room({
  children,
  issueId,
}: {
  children: ReactNode;
  issueId: string;
}) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomId = getRoomId(issueId);

  useEffect(() => {
    // Add a small delay to ensure the room is fully created
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [issueId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading room</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Back to Issues
          </a>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider
      id={roomId}
      initialStorage={{
        meta: new LiveObject({ title: "Untitled issue" }),
        properties: new LiveObject({
          progress: "none",
          priority: "none",
          assignedTo: new LiveList([]),
        }),
        labels: new LiveList([]),
        links: new LiveList([]),
        space: undefined,
        project: undefined,
      }}
    >
      {children}
    </RoomProvider>
  );
}
