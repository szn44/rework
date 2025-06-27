"use client";

import { PropsWithChildren } from "react";
import { InboxProvider } from "@/components/InboxContext";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { SpaceProvider } from "@/components/SpaceContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <InboxProvider>
      <WorkspaceProvider>
        <SpaceProvider>
          {children}
        </SpaceProvider>
      </WorkspaceProvider>
    </InboxProvider>
  );
}
