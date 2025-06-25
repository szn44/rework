import { liveblocks } from "@/liveblocks.server.config";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { roomId, metadata } = await request.json();

    console.log("API: Updating issue with:", { roomId, metadata });

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    // Update the room metadata with partial update
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata,
    });

    console.log("API: Successfully updated room metadata:", updatedRoom.metadata);

    // Force complete cache invalidation
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    if (metadata?.space) {
      revalidatePath(`/spaces/${metadata.space}`, "layout");
      revalidatePath(`/spaces/${metadata.space}`, "page");
    }
    if (metadata?.project && metadata.project !== metadata?.space) {
      revalidatePath(`/spaces/${metadata.project}`, "layout");
      revalidatePath(`/spaces/${metadata.project}`, "page");
    }

    // Return success with updated metadata for confirmation
    return NextResponse.json({ 
      success: true, 
      updatedMetadata: updatedRoom.metadata
    });
  } catch (error) {
    console.error("API Error updating issue:", error);
    return NextResponse.json(
      { error: "Failed to update issue", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 