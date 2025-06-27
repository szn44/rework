import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user info
    const currentUser = {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    };

    // Get workspaces the current user is a member of
    const { data: userWorkspaces, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, slug)")
      .eq("user_id", user.id);

    // Get all workspace members for debugging
    const { data: allMembers, error: membersError } = await supabase
      .from("workspace_members")
      .select("*");

    // Get auth users using admin API
    const { data: authUsers, error: authError2 } = await supabase.auth.admin.listUsers();

    return NextResponse.json({
      currentUser,
      userWorkspaces: userWorkspaces || [],
      allMembers: allMembers || [],
      authUsers: authUsers?.users?.map(u => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown User'
      })) || [],
      errors: {
        workspaceError,
        membersError,
        authError: authError2
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}