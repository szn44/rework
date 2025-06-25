"use client";

import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { ReactNode } from "react";
import { getRoomId } from "@/config";

type DocumentLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function DocumentLayout({ children, header }: DocumentLayoutProps) {
  return (
    <div className="h-full flex flex-col">
      {header && (
        <header className="flex justify-between border-b h-10 px-4 items-center">
          {header}
        </header>
      )}
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type DocumentProvidersProps = {
  children: ReactNode;
  roomId: string;
  initialDocument?: any;
};

export function DocumentProviders({ children, roomId, initialDocument }: DocumentProvidersProps) {
  return (
    <RoomProvider
      id={roomId}
      initialStorage={{
        meta: new LiveObject({ title: initialDocument?.title || "Untitled Document" }),
        properties: new LiveObject({
          progress: "none",
          priority: "none",
          assignedTo: new LiveList([]),
        }),
        labels: new LiveList([]),
        links: new LiveList([]),
      }}
    >
      {children}
    </RoomProvider>
  );
} 