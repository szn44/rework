import { liveblocks } from "@/liveblocks.server.config";
import { getRoomId } from "@/config";
import { LiveObject, LiveList } from "@liveblocks/client";
import { toPlainLson } from "@liveblocks/core";
import { NextRequest, NextResponse } from "next/server";
import { Metadata } from "@/config";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { nanoid } = await import("nanoid");
    const requestData = await request.json();
    
    // Extract data with defaults
    const issueId = requestData.issueId || nanoid();
    const progress = requestData.progress || "none";
    const priority = requestData.priority || "none";
    const space = requestData.space || undefined;
    const project = requestData.project || space; // Use space for backward compatibility
    const title = requestData.title || "Untitled";
    const assignedTo = requestData.assignedTo || [];

    const roomId = getRoomId(issueId);

    const metadata: Metadata = {
      issueId,
      title,
      progress,
      priority,
      assignedTo: Array.isArray(assignedTo) ? assignedTo.join(",") : "none",
      labels: [],
      space,
      project,
    };

    // Create the room
    await liveblocks.createRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata,
    });

    // Initialize storage with proper structure
    const initialStorage: LiveObject<any> = new LiveObject({
      meta: new LiveObject({ title }),
      properties: new LiveObject({
        progress,
        priority,
        assignedTo: new LiveList(Array.isArray(assignedTo) ? assignedTo : []),
      }),
      labels: new LiveList([]),
      links: new LiveList([]),
      space,
      project,
    });

    await liveblocks.initializeStorageDocument(
      roomId,
      toPlainLson(initialStorage) as any
    );

    // Revalidate relevant pages to show the new issue immediately
    revalidatePath("/");
    if (space) {
      revalidatePath(`/spaces/${space}`);
    }

    return NextResponse.json({ success: true, issueId });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
} 