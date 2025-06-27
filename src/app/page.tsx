import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { IssueWithRelations, IssueItem } from "@/config";
import { IssuesView } from "@/components/IssuesView";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { getIssueIdFromIssue } from "@/utils/issueId";

// Disable caching completely during development to fix sync issues
export const revalidate = 0;

export default async function PageIssue() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user has workspaces
  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspace_members")
    .select(`
      workspaces (
        id,
        slug
      )
    `)
    .eq("user_id", user.id)

  // If user has no workspaces, redirect to setup
  if (!workspaces || workspaces.length === 0 || !workspaces.some(w => w.workspaces)) {
    redirect('/setup')
  }

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

  // Convert Supabase issues to IssueItem format
  const issueItems: IssueItem[] = (issues || []).map(issue => {
    // Transform data to match getIssueIdFromIssue expectations
    const transformedIssue = {
      ...issue,
      spaces: issue.spaces ? [issue.spaces] : [] // Wrap single space object in array
    };

    return {
      issue: issue as IssueWithRelations,
      metadata: {
        issueId: getIssueIdFromIssue(transformedIssue),
        title: issue.title || 'Untitled',
        progress: (issue.status as any) || 'none',
        priority: (issue.priority as any) || 'none',
        assignedTo: issue.assignee_ids || [],
        labels: [],
        space: (issue.spaces as any)?.slug || 'general',
        project: issue.workspace_slug,
      }
    };
  })
  
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded overflow-hidden">
        <div className="h-full">
          <IssuesView initialIssues={issueItems} />
        </div>
      </main>
    </ResponsiveLayout>
  );
}
