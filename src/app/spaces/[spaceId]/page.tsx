import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { WikiEditor } from "@/components/WikiEditor";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { RoomWithMetadata } from "@/config";
import { getIssueIdFromIssue } from "@/utils/issueId";

// Cache for 5 seconds to allow faster updates during development
export const revalidate = 5;

export default async function SpacePage({ params }: { params: { spaceId: string } }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get the space by slug
  const { data: space } = await supabase
    .from("spaces")
    .select(`
      id,
      name,
      slug,
      description,
      color,
      workspace_id,
      workspaces (
        name,
        slug
      )
    `)
    .eq("slug", params.spaceId)
    .single()

  if (!space) {
    // Space not found, redirect to main issues page
    redirect('/')
  }

  // Check if user is a member of this workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", space.workspace_id)
    .eq("member_id", user.id)
    .single()

  if (!membership) {
    // User is not a member of this workspace
    redirect('/')
  }

  // Get issues from this space
  const { data: issues } = await supabase
    .from("issues")
    .select(`
      id,
      workspace_slug,
      issue_number,
      title,
      status,
      priority,
      assignee_ids,
      liveblocks_room_id,
      created_at,
      updated_at,
      spaces (
        slug,
        name,
        color
      )
    `)
    .eq("space_id", space.id)
    .order("updated_at", { ascending: false })

  // Convert to kanban format for WikiEditor
  const kanbanItems = (issues || []).map(issue => {
    // Transform data to match getIssueIdFromIssue expectations
    const transformedIssue = {
      ...issue,
      spaces: issue.spaces ? [issue.spaces] : [] // Wrap single space object in array
    };

    return {
      room: {
        type: 'room',
        id: issue.liveblocks_room_id || `liveblocks:examples:nextjs-project-manager-${issue.workspace_slug}-${issue.issue_number}`,
        metadata: {
          issueId: getIssueIdFromIssue(transformedIssue),
          title: issue.title,
          progress: issue.status,
          priority: issue.priority,
          assignedTo: issue.assignee_ids?.join(',') || 'none',
          labels: [],
          space: (issue.spaces as any)?.slug || params.spaceId,
          project: issue.workspace_slug,
        },
        createdAt: issue.created_at,
        lastConnectionAt: issue.updated_at,
        usersAccesses: {},
        groupsAccesses: {},
        defaultAccesses: ['room:write']
      } as RoomWithMetadata,
      metadata: {
        issueId: getIssueIdFromIssue(transformedIssue),
        title: issue.title || "Untitled",
        priority: issue.priority || "none",
        progress: issue.status || "none",
        assignedTo: issue.assignee_ids || [],
        labels: [],
        project: issue.workspace_slug,
        space: (issue.spaces as any)?.slug || params.spaceId,
      },
    };
  });

  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <WikiEditor 
          roomId={`space-${space.slug}-wiki`} 
          spaceName={space.name}
          kanbanItems={kanbanItems}
        />
      </main>
    </ResponsiveLayout>
  );
} 