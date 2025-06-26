import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Returns a list of user IDs from a partial search input
 * For `resolveMentionSuggestions` in liveblocks.config.ts
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") as string;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json([], { status: 200 });
    }

    // First get workspaces the current user is a member of
    const { data: userWorkspaces } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("member_id", user.id);

    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];

    if (workspaceIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get all members from those workspaces
    const { data: workspaceMembers } = await supabase
      .from("workspace_members")
      .select("member_id")
      .in("workspace_id", workspaceIds);

    const memberIds = Array.from(new Set(workspaceMembers?.map(wm => wm.member_id) || []));

    if (memberIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get user details and filter by name
    const { data: users } = await supabase.auth.admin.listUsers();
    
    const filteredUserIds = users.users
      .filter(u => {
        if (!memberIds.includes(u.id)) return false;
        const name = u.user_metadata?.name || u.email?.split('@')[0] || '';
        return name.toLowerCase().includes(text.toLowerCase());
      })
      .map(u => u.id);

    return NextResponse.json(filteredUserIds);
  } catch (error) {
    console.error("Error in user search:", error);
    return NextResponse.json([], { status: 200 });
  }
}
