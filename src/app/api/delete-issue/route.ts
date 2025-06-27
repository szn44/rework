import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();

    if (!issueId) {
      return NextResponse.json(
        { error: "Missing issueId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the issue ID to extract workspace/space slug and number
    let workspaceSlug: string;
    let issueNumber: number;
    let spaceSlug: string | null = null;

    // Parse issue ID format: WORKSPACE-NUMBER or SPACE-NUMBER
    const issueMatch = issueId.match(/^([A-Z]+)-(\d+)$/);
    if (!issueMatch) {
      return NextResponse.json({ error: "Invalid issue ID format" }, { status: 400 });
    }

    const slug = issueMatch[1];
    issueNumber = parseInt(issueMatch[2]);

    // First, try to find it as a workspace issue
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (workspace) {
      // It's a workspace issue
      workspaceSlug = slug;
      spaceSlug = null;
    } else {
      // Try to find it as a space issue
      const { data: space } = await supabase
        .from("spaces")
        .select("slug, workspaces(slug)")
        .ilike("slug", slug.toLowerCase())
        .single();
      
      if (space) {
        // It's a space issue
        spaceSlug = space.slug;
        workspaceSlug = (space.workspaces as any)?.slug;
      } else {
        return NextResponse.json({ error: `No workspace or space found with slug: ${slug}` }, { status: 404 });
      }
    }

    // Find the issue in the database
    let query = supabase
      .from("issues")
      .select("id, workspace_id, space_id")
      .eq("workspace_slug", workspaceSlug)
      .eq("issue_number", issueNumber);

    if (spaceSlug) {
      // Space issue - must have space_id
      const { data: spaceData } = await supabase
        .from("spaces")
        .select("id")
        .eq("slug", spaceSlug)
        .single();
      
      if (spaceData) {
        query = query.eq("space_id", spaceData.id);
      }
    } else {
      // Workspace issue - space_id must be null
      query = query.is("space_id", null);
    }

    const { data: issue, error: findError } = await query.single();

    if (findError || !issue) {
      console.error("Issue not found:", findError);
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Check if user is a member of the workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("workspace_id", issue.workspace_id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the issue from the database
    const { error: deleteError } = await supabase
      .from("issues")
      .delete()
      .eq("id", issue.id);

    if (deleteError) {
      console.error("Error deleting issue:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log("Issue deleted successfully:", issueId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}