import { liveblocks } from "@/liveblocks.server.config";
import { NextRequest, NextResponse } from "next/server";
import { RoomWithMetadata } from "@/config";

export async function POST(request: NextRequest) {
  try {
    // Get all rooms
    const allRooms = (await liveblocks.getRooms()).data as unknown as RoomWithMetadata[];
    
    // Filter to only issue rooms (not wiki or project rooms)
    const issueRooms = allRooms.filter(room => {
      return (
        room.id.startsWith('liveblocks:examples:nextjs-project-manager-') &&
        !room.id.startsWith('liveblocks:examples:nextjs-project-manager-project-') &&
        !room.id.includes('-wiki-')
      );
    });

    console.log(`Found ${issueRooms.length} issue rooms to delete`);

    // Delete all issue rooms
    const deletePromises = issueRooms.map(async (room) => {
      try {
        await liveblocks.deleteRoom(room.id);
        console.log(`Deleted room: ${room.id}`);
        return { success: true, roomId: room.id };
      } catch (error) {
        console.error(`Failed to delete room ${room.id}:`, error);
        return { success: false, roomId: room.id, error: error instanceof Error ? error.message : String(error) };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Cleared ${successCount} issues successfully`,
      details: {
        total: issueRooms.length,
        success: successCount,
        failed: failCount,
        results
      }
    });
  } catch (error) {
    console.error("Error clearing issues:", error);
    return NextResponse.json(
      { error: "Failed to clear issues", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 