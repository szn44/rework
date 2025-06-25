import { liveblocks } from "@/liveblocks.server.config";
import { NextRequest, NextResponse } from "next/server";
import { Metadata } from "@/config";

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    // Get the storage document
    const storage = await liveblocks.getStorageDocument(roomId, "json");

    if (!storage || !storage.meta) {
      return NextResponse.json(
        { error: "Storage not found or invalid" },
        { status: 404 }
      );
    }

    // Extract data from storage to sync to metadata
    const { meta, properties, labels, space, project } = storage;

    // Handle assignedTo - convert LiveList to legacy single assignee for metadata
    let assignedTo: string = "none";
    if (properties?.assignedTo && Array.isArray(properties.assignedTo)) {
      // Take the first assignee for legacy metadata compatibility
      assignedTo = properties.assignedTo.length > 0 ? properties.assignedTo[0] : "none";
    } else if (typeof properties?.assignedTo === "string") {
      // Handle legacy single assignee format
      assignedTo = properties.assignedTo;
    }

    // Create metadata update
    const metadataUpdate: Partial<Metadata> = {
      title: meta.title || "Untitled",
      progress: properties?.progress || "none",
      priority: properties?.priority || "none",
      assignedTo,
      labels: (labels as string[]) || [],
      space: space as string,
      project: project as string,
    };

    // Update room metadata
    await liveblocks.updateRoom(roomId, {
      metadata: metadataUpdate,
    });

    return NextResponse.json({ 
      success: true, 
      synced: metadataUpdate 
    });
  } catch (error) {
    console.error("Error syncing storage to metadata:", error);
    return NextResponse.json(
      { error: "Failed to sync storage to metadata" },
      { status: 500 }
    );
  }
} 