import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspace_id");

    if (workspaceId) {
      // Check if user is a member of the specific workspace
      const { data: membership } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
      }

      // Get spaces for the specific workspace (using team_id column)
      const { data: spaces, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("team_id", workspaceId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return NextResponse.json({ spaces });
    } else {
      // Get all workspaces the user has access to
      const { data: workspaces } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      const workspaceIds = workspaces?.map(w => w.workspace_id) || [];

      if (workspaceIds.length === 0) {
        return NextResponse.json({ spaces: [] });
      }

      // Get spaces for all user's workspaces (using team_id column)
      const { data: spaces, error } = await supabase
        .from("spaces")
        .select("*")
        .in("team_id", workspaceIds)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return NextResponse.json({ spaces });
    }
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Space Creation Debug ===");
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("Auth check:", { user: user?.id, authError });

    if (authError || !user) {
      console.log("Auth failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    console.log("Request body:", requestBody);
    
    const { name, slug, description, color, workspace_id } = requestBody;

    if (!name || !slug || !workspace_id) {
      console.log("Missing required fields:", { name: !!name, slug: !!slug, workspace_id: !!workspace_id });
      return NextResponse.json(
        { error: "name, slug, and workspace_id are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]{2,30}$/.test(slug)) {
      console.log("Invalid slug format:", slug);
      return NextResponse.json(
        { error: "Slug must be 2-30 characters, lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    // Check if user is a member of the workspace
    console.log("Checking workspace membership...");
    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("id, role")
      .eq("workspace_id", workspace_id)
      .eq("user_id", user.id)
      .single();

    console.log("Membership check result:", { membership, membershipError });

    if (!membership) {
      console.log("User not a member of workspace");
      return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    }

    // Create the space (using team_id instead of workspace_id)
    console.log("Creating space with data:", {
      name,
      slug,
      description,
      color: color || '#3b82f6',
      team_id: workspace_id,
      created_by: user.id,
    });

    const { data: space, error } = await supabase
      .from("spaces")
      .insert({
        name,
        slug,
        description,
        color: color || '#3b82f6',
        team_id: workspace_id,
        created_by: user.id,
      })
      .select()
      .single();

    console.log("Space creation result:", { space, error });

    if (error) {
      console.log("Space creation error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "A space with this slug already exists in this workspace" },
          { status: 409 }
        );
      }
      throw error;
    }

    console.log("Space created successfully:", space);
    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    console.error("Error creating space (full error):", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
} 