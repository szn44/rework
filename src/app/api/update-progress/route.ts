import { liveblocks } from "@/liveblocks.server.config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { roomId, progress } = await request.json();

    if (!roomId || !progress) {
      return NextResponse.json(
        { error: "Missing roomId or progress" },
        { status: 400 }
      );
    }

    // Update the room metadata
    await liveblocks.updateRoom(roomId, {
      metadata: {
        progress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
} 