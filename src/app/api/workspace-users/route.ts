import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspaces the current user is a member of
    const { data: userWorkspaces } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("member_id", user.id);

    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];

    if (workspaceIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Get all members from those workspaces
    const { data: workspaceMembers } = await supabase
      .from("workspace_members")
      .select("member_id")
      .in("workspace_id", workspaceIds);

    const memberIds = Array.from(new Set(workspaceMembers?.map(wm => wm.member_id) || []));

    if (memberIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Get user details using server-side auth admin
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    const users = authUsers.users
      .filter(u => memberIds.includes(u.id))
      .map(u => ({
        id: u.id,
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown User',
        email: u.email,
        avatar: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.email}`,
      }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching workspace users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 