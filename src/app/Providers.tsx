"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { PropsWithChildren } from "react";
import { InboxProvider } from "@/components/InboxContext";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { SpaceProvider } from "@/components/SpaceContext";
import { getRoomsFromIds } from "@/actions/liveblocks";

export function Providers({ children }: PropsWithChildren) {
  return (
    <InboxProvider>
      <WorkspaceProvider>
        <SpaceProvider>
          <LiveblocksProvider
          authEndpoint="/api/liveblocks-auth"
          // Get users' info from their ID
          resolveUsers={async ({ userIds }) => {
            const searchParams = new URLSearchParams(
              userIds.map((userId) => ["userIds", userId])
            );
            const response = await fetch(`/api/users?${searchParams}`);

            if (!response.ok) {
              throw new Error("Problem resolving users");
            }

            const users = await response.json();
            return users;
          }}
          // Find a list of users that match the current search term
          resolveMentionSuggestions={async ({ text }) => {
            const response = await fetch(
              `/api/users/search?text=${encodeURIComponent(text)}`
            );

            if (!response.ok) {
              throw new Error("Problem resolving mention suggestions");
            }

            const userIds = await response.json();
            return userIds;
          }}
          // Add room metadata to `useRoomInfo` - Fixed with proper promise handling
          resolveRoomsInfo={async ({ roomIds }) => {
            const rooms = await getRoomsFromIds(roomIds);
            return rooms.map((room) => ({
              id: room.id,
              metadata: room.metadata,
            }));
          }}
        >
          {children}
        </LiveblocksProvider>
        </SpaceProvider>
      </WorkspaceProvider>
    </InboxProvider>
  );
}
