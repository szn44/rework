import { liveblocks } from "@/liveblocks.server.config";
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

    const { roomId, metadata, ...otherData } = await request.json();
    console.log("Update request:", { roomId, metadata, otherData });

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    // Extract the issue ID from roomId (format: liveblocks:examples:nextjs-project-manager-WORKSPACE-NUMBER or SPACE-NUMBER-spaceslug)
    const roomIdParts = roomId.replace('liveblocks:examples:nextjs-project-manager-', '');
    console.log("Room ID parts:", roomIdParts);

    // Parse the issue identifier
    let workspaceSlug: string;
    let issueNumber: number;
    let isSpaceIssue = false;

    // Check if it's a space issue (contains space slug at the end)
    const spaceIssueMatch = roomIdParts.match(/^([A-Z]+)-(\d+)-([a-z]+)$/);
    const workspaceIssueMatch = roomIdParts.match(/^([A-Z]+)-(\d+)$/);

    if (spaceIssueMatch) {
      // Space issue: SPACE-NUMBER-spaceslug
      const spaceCode = spaceIssueMatch[1];
      issueNumber = parseInt(spaceIssueMatch[2]);
      const spaceSlug = spaceIssueMatch[3];
      
      // Find the space and get its workspace
      const { data: space } = await supabase
        .from("spaces")
        .select("workspace_id, workspaces(slug)")
        .eq("slug", spaceSlug)
        .single();
      
      if (!space) {
        return NextResponse.json({ error: "Space not found" }, { status: 404 });
      }
      
      workspaceSlug = (space.workspaces as any)?.slug;
      isSpaceIssue = true;
    } else if (workspaceIssueMatch) {
      // Workspace issue: WORKSPACE-NUMBER
      workspaceSlug = workspaceIssueMatch[1];
      issueNumber = parseInt(workspaceIssueMatch[2]);
    } else {
      console.error("Invalid room ID format:", roomIdParts);
      return NextResponse.json({ error: "Invalid room ID format" }, { status: 400 });
    }

    console.log("Parsed:", { workspaceSlug, issueNumber, isSpaceIssue });

    // Find the issue in the database
    const { data: issue, error: findError } = await supabase
      .from("issues")
      .select("id, workspace_id, space_id")
      .eq("workspace_slug", workspaceSlug)
      .eq("issue_number", issueNumber)
      .single();

    if (findError || !issue) {
      console.error("Issue not found:", findError);
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    console.log("Found issue:", issue);

    // Check if user is a member of the workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("member_id", user.id)
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
    if (otherData?.title) updateData.title = otherData.title;
    if (otherData?.status) updateData.status = otherData.status;
    if (otherData?.priority) updateData.priority = otherData.priority;

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

    // Update Liveblocks room metadata if provided
    if (metadata) {
      try {
        await liveblocks.updateRoom(roomId, { metadata });
        console.log("Liveblocks room metadata updated");
      } catch (liveblooksError) {
        console.error("Error updating Liveblocks room:", liveblooksError);
        // Don't fail the request if Liveblocks update fails
      }
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