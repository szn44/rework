import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Update issue API called");
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { issueId, metadata, content, content_text, ...otherData } = await request.json();
    console.log("Update request:", { issueId, metadata, content, otherData });

    if (!issueId) {
      return NextResponse.json({ error: "issueId is required" }, { status: 400 });
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

    console.log("Found issue:", issue);

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

    // Prepare update data
    const updateData: any = {};
    
    if (metadata?.title) updateData.title = metadata.title;
    if (metadata?.progress) updateData.status = metadata.progress;
    if (metadata?.priority) updateData.priority = metadata.priority;
    if (metadata?.assignedTo) {
      // Convert assignedTo string to array if needed
      if (typeof metadata.assignedTo === 'string') {
        updateData.assignee_ids = metadata.assignedTo === 'none' ? [] : metadata.assignedTo.split(',');
      } else if (Array.isArray(metadata.assignedTo)) {
        updateData.assignee_ids = metadata.assignedTo;
      }
    }
    
    if (otherData?.title) updateData.title = otherData.title;
    if (otherData?.status) updateData.status = otherData.status;
    if (otherData?.priority) updateData.priority = otherData.priority;
    if (otherData?.assignee_ids) updateData.assignee_ids = otherData.assignee_ids;
    
    // Handle content updates
    if (content !== undefined) updateData.content = content;
    if (content_text !== undefined) updateData.content_text = content_text;

    console.log("Update data:", updateData);

    // Update the issue in the database if there's data to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("issues")
        .update(updateData)
        .eq("id", issue.id);

      if (updateError) {
        console.error("Error updating issue:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      console.log("Issue updated in database");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: `Failed to update issue: ${error}` },
      { status: 500 }
    );
  }
} 