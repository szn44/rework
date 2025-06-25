"use client";

import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { ReactNode } from "react";
import { ProjectIssue } from "@/components/ProjectIssue";
import RoomErrors from "@/components/RoomErrors";

export function ProjectRoom({ projectId }: { projectId: string }) {
  const roomId = `liveblocks:examples:nextjs-project-manager-project-${projectId}`;

  return (
    <RoomProvider
      id={roomId}
      initialStorage={{
        meta: new LiveObject({ title: `Project ${projectId}` }),
        properties: new LiveObject({
          progress: "none",
          priority: "none",
          assignedTo: new LiveList([]),
        }),
        labels: new LiveList([]),
        links: new LiveList([]),
        projectStatus: "not-started",
        projectClient: "",
        projectBudget: 0,
        projectStartDate: "",
        projectEndDate: "",
      }}
    >
      <RoomErrors />
      <ProjectIssue projectId={projectId} />
    </RoomProvider>
  );
} 