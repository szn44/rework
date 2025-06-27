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

    // Get user's workspaces
    const { data: workspaceMemberships } = await supabase
      .from("workspace_members")
      .select(`
        workspace_id,
        role,
        workspaces (
          slug
        )
      `)
      .eq("member_id", user.id);

    // Start an auth session for Liveblocks
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
        }
      }
    );

    // Grant access to workspace issue rooms
    if (workspaceMemberships) {
      for (const membership of workspaceMemberships) {
        const workspace = membership.workspaces as any;
        if (workspace?.slug) {
          const workspaceSlug = workspace.slug;
          // Grant full access to all issues in workspaces the user belongs to
          session.allow(`liveblocks:examples:nextjs-project-manager-${workspaceSlug}-*`, session.FULL_ACCESS);
          session.allow(`liveblocks:examples:nextjs-project-manager-*-*`, session.FULL_ACCESS);
        }
      }
    }

    // If user has no memberships yet (first time), give them access to demo/create flows
    if (!workspaceMemberships?.length) {
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
