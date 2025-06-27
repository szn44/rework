import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    console.log("Create issue API called");
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await request.json();
    console.log("Request data:", requestData);
    
    // Validate required fields
    if (!requestData.workspace_id) {
      return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
    }

    // Check if user is member of the workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("workspace_id", requestData.workspace_id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "You must be a member of the workspace to create issues" }, { status: 403 });
    }

    // Extract data with defaults
    const title = requestData.title || "Untitled";
    const description = requestData.description || "";
    const status = requestData.status || "todo";
    const priority = requestData.priority || "none";
    const assignee_ids = requestData.assignee_ids || [];
    const space_id = requestData.space_id || null;

    // Default content for the issue (Lexical editor format)
    const defaultContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: description ? [{ type: "text", text: description }] : []
        }
      ]
    };

    console.log("Creating issue with:", { title, status, priority, space_id });

    // Create issue in Supabase (triggers will auto-populate fields)
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .insert({
        title,
        description,
        content: defaultContent,
        content_text: description,
        status,
        priority,
        assignee_ids,
        workspace_id: requestData.workspace_id,
        space_id,
        created_by: user.id
      })
      .select(`
        id,
        workspace_slug,
        issue_number,
        title,
        status,
        priority,
        space_id,
        assignee_ids,
        content,
        content_text
      `)
      .single();

    if (issueError) {
      console.error("Error creating issue in database:", issueError);
      return NextResponse.json({ error: issueError.message }, { status: 500 });
    }

    console.log("Issue created in database:", issue);

    // Generate the issue ID for display
    let displayIssueId: string;
    let spaceSlug = "";
    
    if (issue.space_id) {
      // Get space info
      const { data: space } = await supabase
        .from("spaces")
        .select("slug")
        .eq("id", issue.space_id)
        .single();
      
      if (space) {
        spaceSlug = space.slug;
        displayIssueId = `${space.slug.toUpperCase()}-${issue.issue_number}`;
      } else {
        displayIssueId = `${issue.workspace_slug}-${issue.issue_number}`;
      }
    } else {
      displayIssueId = `${issue.workspace_slug}-${issue.issue_number}`;
    }

    console.log("Generated display issue ID:", displayIssueId);

    // Revalidate relevant pages
    revalidatePath("/");
    if (spaceSlug) {
      revalidatePath(`/spaces/${spaceSlug}`);
    }

    console.log("Returning success response");

    return NextResponse.json({ 
      success: true, 
      issueId: displayIssueId,
      issue: {
        ...issue,
        displayIssueId
      }
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: `Failed to create issue: ${error}` },
      { status: 500 }
    );
  }
} 