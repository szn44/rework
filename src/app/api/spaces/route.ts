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
        .eq("member_id", user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
      }

      // Get spaces for the specific workspace
      const { data: spaces, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("workspace_id", workspaceId)
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
        .eq("member_id", user.id);

      const workspaceIds = workspaces?.map(w => w.workspace_id) || [];

      if (workspaceIds.length === 0) {
        return NextResponse.json({ spaces: [] });
      }

      // Get spaces for all user's workspaces
      const { data: spaces, error } = await supabase
        .from("spaces")
        .select("*")
        .in("workspace_id", workspaceIds)
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, color, workspace_id } = await request.json();

    if (!name || !slug || !workspace_id) {
      return NextResponse.json(
        { error: "name, slug, and workspace_id are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]{2,30}$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be 2-30 characters, lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    // Check if user is a member of the workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("member_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    }

    // Create the space
    const { data: space, error } = await supabase
      .from("spaces")
      .insert({
        name,
        slug,
        description,
        color: color || '#3b82f6',
        workspace_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "A space with this slug already exists in this workspace" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    console.error("Error creating space:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 