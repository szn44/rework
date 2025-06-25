import { liveblocks } from "@/liveblocks.server.config";
import { getRoomId } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();

    if (!issueId) {
      return NextResponse.json(
        { error: "Missing issueId" },
        { status: 400 }
      );
    }

    const roomId = getRoomId(issueId);

    // Delete the room
    await liveblocks.deleteRoom(roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
} 