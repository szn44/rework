"use server";

import { redirect } from "next/navigation";
import { getRoomId, Metadata, RoomWithMetadata } from "@/config";
import { liveblocks } from "@/liveblocks.server.config";
import { LiveList, LiveObject, toPlainLson } from "@liveblocks/core";
import { ProgressState } from "@/config";

export async function createIssue() {
  const { nanoid } = await import("nanoid");
  const issueId = nanoid();
  const roomId = getRoomId(issueId);

  const metadata: Metadata = {
    issueId,
    title: "Untitled",
    progress: "none",
    priority: "none",
    assignedTo: "none",
    labels: [],
  };

  await liveblocks.createRoom(roomId, {
    defaultAccesses: ["room:write"],
    metadata,
  });

  const initialStorage: LiveObject<Liveblocks["Storage"]> = new LiveObject({
    meta: new LiveObject({ title: "Untitled" }),
    properties: new LiveObject({
      progress: "none",
      priority: "none",
      assignedTo: new LiveList([]),
    }),
    labels: new LiveList([]),
    links: new LiveList([]),
    space: undefined,
    project: undefined,
  });

  await liveblocks.initializeStorageDocument(
    roomId,
    toPlainLson(initialStorage) as any
  );

  redirect(`/issue/${issueId}`);
}

export async function createIssueWithProgress(progressType: string) {
  const { nanoid } = await import("nanoid");
  const issueId = nanoid();
  const roomId = getRoomId(issueId);

  // Map progressType to valid values - use the column IDs directly
  const progressMap: Record<string, ProgressState> = {
    "todo": "todo",
    "progress": "progress", 
    "review": "review",
    "done": "done"
  };

  const progress = progressMap[progressType] || "none";

  const metadata: Metadata = {
    issueId,
    title: "Untitled",
    progress,
    priority: "none",
    assignedTo: "none",
    labels: [],
  };

  await liveblocks.createRoom(roomId, {
    defaultAccesses: ["room:write"],
    metadata,
  });

  const initialStorage: LiveObject<Liveblocks["Storage"]> = new LiveObject({
    meta: new LiveObject({ title: "Untitled" }),
    properties: new LiveObject({
      progress,
      priority: "none",
      assignedTo: new LiveList([]),
    }),
    labels: new LiveList([]),
    links: new LiveList([]),
    space: undefined,
    project: undefined,
  });

  await liveblocks.initializeStorageDocument(
    roomId,
    toPlainLson(initialStorage) as any
  );

  // Add a small delay to ensure the room is fully ready
  await new Promise(resolve => setTimeout(resolve, 200));

  return issueId; // Return issueId instead of redirecting
}

export async function createIssueWithProgressAndRedirect(progressType: string) {
  const issueId = await createIssueWithProgress(progressType);
  redirect(`/issue/${issueId}`);
}

export async function getStorageDocument(roomId: string) {
  const storage = await liveblocks.getStorageDocument(roomId, "json");
  return storage;
}

export async function getRoomsFromIds(roomIds: string[]) {
  const promises = [];

  for (const roomId of roomIds) {
    promises.push(liveblocks.getRoom(roomId));
  }

  return (await Promise.all(promises)) as unknown as RoomWithMetadata[];
}

export async function deleteRoom(roomId: string) {
  await liveblocks.deleteRoom(roomId);
  redirect("/");
}

export async function createOrGetWikiRoom(issueId: string = "wiki-main") {
  const roomId = getRoomId(issueId); // Use the same room ID transformation
  
  try {
    // Try to get the existing room first
    const existingRoom = await liveblocks.getRoom(roomId);
    return existingRoom;
  } catch (error) {
    // If room doesn't exist, create it
    const metadata: Partial<Metadata> = {
      issueId,
      title: "WiKi",
      progress: "none",
      priority: "none",
      assignedTo: "none",
      labels: [],
    };

    await liveblocks.createRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata,
    });

    const initialStorage: LiveObject<Liveblocks["Storage"]> = new LiveObject({
      meta: new LiveObject({ title: "WiKi" }),
      properties: new LiveObject({
        progress: "none",
        priority: "none",
        assignedTo: new LiveList([]),
      }),
      labels: new LiveList([]),
      links: new LiveList([]),
      space: undefined,
      project: undefined,
    });

    await liveblocks.initializeStorageDocument(
      roomId,
      toPlainLson(initialStorage) as any
    );

    return await liveblocks.getRoom(roomId);
  }
}

export async function createOrGetProjectRoom(projectId: string) {
  const roomId = `project-${projectId}`;
  
  try {
    // Try to get the existing room first
    const existingRoom = await liveblocks.getRoom(roomId);
    return existingRoom;
  } catch (error) {
    // If room doesn't exist, create it
    const metadata = {
      projectId,
      title: `Project ${projectId}`,
      status: "not-started",
      client: "",
      budget: "0",
      startDate: "",
      endDate: "",
    };

    await liveblocks.createRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata,
    });

    const initialStorage: LiveObject<Liveblocks["Storage"]> = new LiveObject({
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
    });

    await liveblocks.initializeStorageDocument(
      roomId,
      toPlainLson(initialStorage) as any
    );

    return await liveblocks.getRoom(roomId);
  }
}
