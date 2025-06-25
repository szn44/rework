"use client";

import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { ReactNode } from "react";
import { ProjectIssue } from "@/components/ProjectIssue";
import RoomErrors from "@/components/RoomErrors";

interface ProjectWrapperProps {
  projectId: string;
}

export function ProjectWrapper({ projectId }: ProjectWrapperProps) {
  const roomId = `liveblocks:examples:nextjs-project-manager-project-${projectId}`;

  return (
    <>
      <RoomErrors />
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
        <ProjectIssue projectId={projectId} />
      </RoomProvider>
    </>
  );
} 