import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's workspace memberships
    const { data: memberships, error: membershipError } = await supabase
      .from("workspace_members")
      .select(`
        workspace_id,
        role,
        workspaces (
          id,
          name,
          slug
        )
      `)
      .eq("user_id", user.id);

    // Get all workspaces for comparison
    const { data: allWorkspaces, error: allWorkspacesError } = await supabase
      .from("workspaces")
      .select("id, name, slug, created_by");

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      memberships,
      membershipError,
      allWorkspaces,
      allWorkspacesError,
      debug: {
        membershipQuery: "workspace_members where user_id = auth.uid()",
        expectedColumns: ["workspace_id", "user_id", "role"]
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}