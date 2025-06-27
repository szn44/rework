import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("workspace-users API: Auth error or no user:", { authError, hasUser: !!user });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("workspace-users API: Current user ID:", user.id);

    // Get workspaces the current user is a member of
    const { data: userWorkspaces, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id);

    console.log("workspace-users API: User workspaces query result:", {
      userWorkspaces,
      workspaceError
    });

    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];
    console.log("workspace-users API: Workspace IDs:", workspaceIds);

    if (workspaceIds.length === 0) {
      console.log("workspace-users API: No workspaces found for user");
      return NextResponse.json({ users: [] });
    }

    // Get all members from those workspaces
    const { data: workspaceMembers, error: membersError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .in("workspace_id", workspaceIds);

    console.log("workspace-users API: Workspace members query result:", {
      workspaceMembers,
      membersError
    });

    const memberIds = Array.from(new Set(
      workspaceMembers
        ?.map(wm => wm.user_id)
        .filter(id => id !== null && id !== undefined) || []
    ));

    if (memberIds.length === 0) {
      console.log("workspace-users API: No valid member IDs found");
      return NextResponse.json({ users: [] });
    }

    console.log("workspace-users API: memberIds found:", memberIds);

    // First try to get users from a user_profiles table if it exists
    const { data: userProfiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url, email")
      .in("user_id", memberIds);

    console.log("workspace-users API: user profiles found:", userProfiles);
    console.log("workspace-users API: profiles error:", profilesError);

    // Try to get current user info for at least one real user
    const currentUser = user;
    
    // Build users array with available information
    const users = memberIds.map(memberId => {
      // Check if we have profile data for this user
      const profile = userProfiles?.find(p => p.user_id === memberId);
      
      if (profile && profile.display_name) {
        return {
          id: memberId,
          name: profile.display_name,
          email: profile.email || currentUser.email || `user-${memberId}@example.com`,
          avatar: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.display_name}`,
        };
      }
      
      // If this is the current user, use their real info
      if (memberId === currentUser.id) {
        return {
          id: memberId,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'You',
          email: currentUser.email || `user-${memberId}@example.com`,
          avatar: currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.email}`,
        };
      }
      
      // Check if we have profile with email but no display name
      if (profile && profile.email) {
        return {
          id: memberId,
          name: profile.email.split('@')[0] || `User ${memberId.slice(0, 8)}`,
          email: profile.email,
          avatar: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.email}`,
        };
      }
      
      // Fallback for other users
      return {
        id: memberId,
        name: `User ${memberId.slice(0, 8)}`,
        email: `user-${memberId}@example.com`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${memberId}`,
      };
    });

    console.log("workspace-users API: Final users list:", users);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching workspace users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 