import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');

    if (!issueId) {
      return NextResponse.json({ error: "issueId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the issue ID to extract workspace/space slug and number
    let workspaceSlug: string;
    let issueNumber: number;
    let spaceSlug: string | null = null;

    // Check if it's a space issue (contains space slug at the beginning)
    const spaceIssueMatch = issueId.match(/^([A-Z]+)-(\d+)$/);
    if (spaceIssueMatch && spaceIssueMatch[1] !== 'OPEN') {
      // Space issue: SPACE-NUMBER
      const spaceCode = spaceIssueMatch[1];
      issueNumber = parseInt(spaceIssueMatch[2]);
      
      // Find the space by slug (case insensitive)
      const { data: space } = await supabase
        .from("spaces")
        .select("slug, workspaces(slug)")
        .ilike("slug", `%${spaceCode.toLowerCase()}%`)
        .single();
      
      if (space) {
        spaceSlug = space.slug;
        workspaceSlug = (space.workspaces as any)?.slug;
      } else {
        return NextResponse.json({ error: "Space not found" }, { status: 404 });
      }
    } else {
      // Workspace issue: WORKSPACE-NUMBER
      const workspaceIssueMatch = issueId.match(/^([A-Z]+)-(\d+)$/);
      if (workspaceIssueMatch) {
        workspaceSlug = workspaceIssueMatch[1];
        issueNumber = parseInt(workspaceIssueMatch[2]);
      } else {
        return NextResponse.json({ error: "Invalid issue ID format" }, { status: 400 });
      }
    }

    // Find the issue in the database
    let query = supabase
      .from("issues")
      .select("liveblocks_room_id")
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

    const { data: issue, error } = await query.single();

    if (error || !issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ roomId: issue.liveblocks_room_id });
  } catch (error) {
    console.error("Error getting room ID:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 