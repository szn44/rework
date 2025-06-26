import { Liveblocks } from "@liveblocks/node";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Authenticating your Liveblocks application
// https://liveblocks.io/docs/authentication

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations and workspaces
    const { data: orgMemberships } = await supabase
      .from("organization_members")
      .select(`
        org_id,
        role,
        organizations (
          slug
        )
      `)
      .eq("user_id", user.id);

    const { data: workspaceMemberships } = await supabase
      .from("workspace_members")
      .select(`
        workspace_id,
        role,
        workspaces (
          slug,
          org_id,
          organizations (
            slug
          )
        )
      `)
      .eq("member_id", user.id);

    // Start an auth session for Liveblocks
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
          avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
        }
      }
    );

    // Grant access to organization rooms
    if (orgMemberships) {
      for (const membership of orgMemberships) {
        const org = membership.organizations as any;
        const orgSlug = org?.slug;
        if (orgSlug) {
          // Give read access to organization-level rooms
          session.allow(`org:${orgSlug}:*`, session.READ_ACCESS);
          
          // Give full access if admin/owner
          if (membership.role === 'owner' || membership.role === 'admin') {
            session.allow(`org:${orgSlug}:*`, session.FULL_ACCESS);
          }
        }
      }
    }

    // Grant access to workspace issue rooms
    if (workspaceMemberships) {
      for (const membership of workspaceMemberships) {
        const workspace = membership.workspaces as any;
        const org = workspace?.organizations as any;
        if (workspace?.slug && org?.slug) {
          const orgSlug = org.slug;
          const workspaceSlug = workspace.slug;
          
          // Grant full access to all issues in workspaces the user belongs to
          // This covers both workspace issues (WORKSPACE-NUMBER) and space issues (SPACE-NUMBER-spaceslug)
          session.allow(`liveblocks:examples:nextjs-project-manager-${workspaceSlug}-*`, session.FULL_ACCESS);
          session.allow(`liveblocks:examples:nextjs-project-manager-*-*`, session.FULL_ACCESS);
          
          // Also grant access to workspace-level rooms
          session.allow(`org:${orgSlug}:workspace:${workspaceSlug}:*`, session.FULL_ACCESS);
        }
      }
    }

    // If user has no memberships yet (first time), give them access to demo/create flows
    if (!orgMemberships?.length && !workspaceMemberships?.length) {
      // Allow access to demo rooms or organization creation flows
      session.allow("demo:*", session.FULL_ACCESS);
    }

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    return new Response(body, { status });

  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
