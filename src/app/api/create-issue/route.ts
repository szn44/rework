import { liveblocks } from "@/liveblocks.server.config";
import { createClient } from "@/utils/supabase/server";
import { LiveObject, LiveList } from "@liveblocks/client";
import { toPlainLson } from "@liveblocks/core";
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
      .eq("member_id", user.id)
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

    console.log("Creating issue with:", { title, status, priority, space_id });

    // Create issue in Supabase (triggers will auto-populate fields)
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .insert({
        title,
        description,
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
        liveblocks_room_id,
        space_id,
        assignee_ids
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

    // Create Liveblocks room
    const roomId = issue.liveblocks_room_id;
    console.log("Creating Liveblocks room:", roomId);

    const metadata = {
      issueId: displayIssueId,
      title: issue.title,
      progress: issue.status,
      priority: issue.priority,
      assignedTo: issue.assignee_ids?.length > 0 ? issue.assignee_ids.join(",") : "none",
      labels: [],
      space: spaceSlug || "general",
      project: issue.workspace_slug,
    };

    console.log("Creating room with metadata:", metadata);

    try {
      // First try to create the room
      await liveblocks.createRoom(roomId, {
        defaultAccesses: ["room:write"],
        metadata,
        usersAccesses: {
          [user.id]: ["room:write"]
        }
      });
      console.log("Room created successfully");
    } catch (roomError: any) {
      console.log("Room creation error:", roomError);
      
      // If room already exists, try to update it instead
      if (roomError.message?.includes("already exists") || roomError.status === 409) {
        console.log("Room already exists, updating metadata and access...");
        try {
          await liveblocks.updateRoom(roomId, {
            metadata,
            usersAccesses: {
              [user.id]: ["room:write"]
            }
          });
          console.log("Room updated successfully");
        } catch (updateError) {
          console.error("Failed to update existing room:", updateError);
          // Continue anyway - the room exists, which is what matters
        }
      } else {
        // For other errors, throw them
        throw roomError;
      }
    }

    // Initialize storage
    const initialStorage = new LiveObject({
      meta: new LiveObject({ title: issue.title }),
      properties: new LiveObject({
        progress: issue.status,
        priority: issue.priority,
        assignedTo: new LiveList(issue.assignee_ids || []),
      }),
      labels: new LiveList([]),
      links: new LiveList([]),
      space: spaceSlug || "general",
      project: issue.workspace_slug,
    });

    await liveblocks.initializeStorageDocument(
      roomId,
      toPlainLson(initialStorage) as any
    );

    console.log("Liveblocks room created and initialized");

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