import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { liveblocks } from "@/liveblocks.server.config";
import { RoomWithMetadata } from "@/config";
import { IssuesView } from "@/components/IssuesView";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { WikiEditor } from "@/components/WikiEditor";
import { getIssueIdFromIssue } from "@/utils/issueId";

// Disable caching completely during development to fix sync issues
export const revalidate = 0;

export default async function PageIssue() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user has organizations
  const { data: organizations } = await supabase
    .from("organization_members")
    .select(`
      organizations (
        id,
        name,
        slug
      )
    `)
    .eq("user_id", user.id)

  // If user has no organizations, redirect to setup
  if (!organizations || organizations.length === 0) {
    redirect('/setup')
  }

  // Get user's workspaces to determine which issues to show
  const { data: workspaces } = await supabase
    .from("workspace_members")
    .select(`
      workspaces (
        id,
        slug
      )
    `)
    .eq("member_id", user.id)

  const workspaceSlugs = workspaces?.map(w => (w.workspaces as any)?.slug).filter(Boolean) || []

  // Get issues from Supabase instead of just Liveblocks rooms
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
      workspaces (
        name,
        slug
      ),
      spaces (
        slug,
        name,
        color
      )
    `)
    .in("workspace_slug", workspaceSlugs)
    .order("updated_at", { ascending: false })

  // Convert Supabase issues to RoomWithMetadata format for compatibility
  const issueRooms: RoomWithMetadata[] = (issues || []).map(issue => {
    // Transform data to match getIssueIdFromIssue expectations
    const transformedIssue = {
      ...issue,
      spaces: issue.spaces ? [issue.spaces] : [] // Wrap single space object in array
    };

    return {
      type: 'room',
      id: issue.liveblocks_room_id || `liveblocks:examples:nextjs-project-manager-${issue.workspace_slug}-${issue.issue_number}`,
      metadata: {
        issueId: getIssueIdFromIssue(transformedIssue),
        title: issue.title,
        progress: issue.status,
        priority: issue.priority,
        assignedTo: issue.assignee_ids?.join(',') || 'none',
        labels: [],
        space: (issue.spaces as any)?.slug || 'general',
        project: issue.workspace_slug,
      },
      createdAt: issue.created_at,
      lastConnectionAt: issue.updated_at,
      usersAccesses: {},
      groupsAccesses: {},
      defaultAccesses: ['room:write']
    } as RoomWithMetadata;
  })
  
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded overflow-hidden">
       
        
        {/* Content */}
        <div>
          <IssuesView initialRooms={issueRooms} />
        </div>
      </main>
    </ResponsiveLayout>
  );
}
