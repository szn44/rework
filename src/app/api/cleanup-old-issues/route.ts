import { liveblocks } from "@/liveblocks.server.config";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all Liveblocks rooms
    const { data: rooms } = await liveblocks.getRooms();
    
    // Get all issues from database to compare
    const { data: dbIssues } = await supabase
      .from("issues")
      .select("liveblocks_room_id");

    const dbRoomIds = new Set(dbIssues?.map(issue => issue.liveblocks_room_id).filter(Boolean) || []);
    
    // Find orphaned rooms (exist in Liveblocks but not in database)
    const orphanedRooms = rooms.filter(room => 
      room.id.includes('liveblocks:examples:nextjs-project-manager') && 
      !dbRoomIds.has(room.id)
    );

    console.log(`Found ${orphanedRooms.length} orphaned rooms to clean up`);

    // Delete orphaned rooms
    const deletionResults = [];
    for (const room of orphanedRooms) {
      try {
        await liveblocks.deleteRoom(room.id);
        deletionResults.push({ roomId: room.id, status: 'deleted' });
        console.log(`Deleted orphaned room: ${room.id}`);
      } catch (error) {
        deletionResults.push({ roomId: room.id, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        console.error(`Failed to delete room ${room.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${orphanedRooms.length} orphaned rooms`,
      results: deletionResults
    });
  } catch (error) {
    console.error("Error cleaning up old issues:", error);
    return NextResponse.json(
      { error: "Failed to cleanup old issues" },
      { status: 500 }
    );
  }
} 