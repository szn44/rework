import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Current user ID:", user.id);

    // Check current workspace memberships
    const { data: existingMemberships } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("user_id", user.id);

    console.log("Existing memberships:", existingMemberships);

    // Get all workspaces
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("*");

    console.log("All workspaces:", workspaces);

    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json({ 
        error: "No workspaces found. Create a workspace first." 
      }, { status: 404 });
    }

    // Find workspaces where the current user is not a member
    const membershipWorkspaceIds = existingMemberships?.map(m => m.workspace_id) || [];
    const missingMemberships = workspaces.filter(w => !membershipWorkspaceIds.includes(w.id));

    console.log("Missing memberships for workspaces:", missingMemberships);

    if (missingMemberships.length === 0) {
      return NextResponse.json({ 
        message: "User is already a member of all workspaces",
        memberships: existingMemberships
      });
    }

    // Add user as member to workspaces they're missing from
    const newMemberships = missingMemberships.map(workspace => ({
      workspace_id: workspace.id,
      user_id: user.id,
      role: workspace.created_by === user.id ? 'admin' : 'member'
    }));

    console.log("Adding new memberships:", newMemberships);

    const { data: insertedMemberships, error: insertError } = await supabase
      .from("workspace_members")
      .insert(newMemberships)
      .select();

    if (insertError) {
      console.error("Error inserting memberships:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("Successfully added memberships:", insertedMemberships);

    return NextResponse.json({ 
      message: "Successfully added user to workspace(s)",
      addedMemberships: insertedMemberships,
      totalMemberships: (existingMemberships?.length || 0) + (insertedMemberships?.length || 0)
    });

  } catch (error) {
    console.error("Error fixing membership:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}