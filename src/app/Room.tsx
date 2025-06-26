"use client";

import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { ReactNode, useEffect, useState } from "react";

export function Room({
  children,
  issueId,
}: {
  children: ReactNode;
  issueId: string;
}) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoomId() {
      try {
        const response = await fetch(`/api/get-room-id?issueId=${encodeURIComponent(issueId)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Issue not found. This issue may have been deleted or you may not have access to it.");
          } else {
            setError("Failed to load issue. Please try again.");
          }
          return;
        }
        
        const data = await response.json();
        setRoomId(data.roomId);
      } catch (err) {
        console.error("Error fetching room ID:", err);
        setError("Failed to load issue. Please check your connection.");
      }
    }

    fetchRoomId();
  }, [issueId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Issue not found</h2>
          <p className="text-gray-600 mb-4">This issue may have been deleted or is still being created.</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            ← Back to issue list
          </a>
        </div>
      </div>
    );
  }

  if (!roomId) {
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
