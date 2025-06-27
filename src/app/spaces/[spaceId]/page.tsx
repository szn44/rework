import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { IssuesView } from "@/components/IssuesView";
import { IssueItem, IssueWithRelations } from "@/config";
import { getIssueIdFromIssue } from "@/utils/issueId";

// Cache for 5 seconds to allow faster updates during development
export const revalidate = 5;

export default async function SpacePage({ params }: { params: { spaceId: string } }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get the space by slug (using team_id instead of workspace_id)
  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select(`
      id,
      name,
      slug,
      description,
      color,
      team_id
    `)
    .eq("slug", params.spaceId)
    .single()

  console.log('Space lookup for slug:', params.spaceId)
  console.log('Space result:', space)
  console.log('Space error:', spaceError)

  if (!space) {
    console.log('Space not found, redirecting to /')
    // Space not found, redirect to main issues page
    redirect('/')
  }

  // Get workspace info separately since foreign key might not exist
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, slug")
    .eq("id", space.team_id)
    .single()

  // Check if user is a member of this workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", space.team_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    // User is not a member of this workspace
    redirect('/')
  }

  // Get issues from this space
  const { data: rawIssues } = await supabase
    .from("issues")
    .select(`
      id,
      workspace_slug,
      issue_number,
      title,
      status,
      priority,
      assignee_ids,
      created_at,
      updated_at,
      workspace_id,
      space_id,
      description,
      content,
      content_text,
      created_by
    `)
    .eq("space_id", space.id)
    .order("updated_at", { ascending: false })

  // Transform raw issues into IssueItem format
  const issues: IssueItem[] = (rawIssues || []).map(issue => {
    const issueWithRelations: IssueWithRelations = {
      ...issue,
      workspaces: workspace,
      spaces: space
    };

    return {
      issue: issueWithRelations,
      metadata: {
        issueId: getIssueIdFromIssue(issueWithRelations),
        title: issue.title || "Untitled",
        progress: (issue.status as any) || "todo",
        priority: (issue.priority as any) || "none",
        assignedTo: issue.assignee_ids || [],
        labels: [],
        project: workspace?.slug || "",
        space: space.slug
      }
    };
  });

  return (
    <ResponsiveLayout>
      <main className="flex-1 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-sm" 
              style={{ backgroundColor: space.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {space.name}
            </h1>
            {space.description && (
              <span className="text-gray-500">• {space.description}</span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <IssuesView 
            initialIssues={issues}
          />
        </div>
      </main>
    </ResponsiveLayout>
  );
} 