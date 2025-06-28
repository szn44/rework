const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testWorkspaceUsersLogic() {
  console.log('Testing workspace users API logic...');
  
  // Create service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get a test user ID from the database
    const { data: users, error: usersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .limit(1);

    if (usersError) {
      console.error('Error getting test user:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No workspace members found');
      return;
    }

    const testUserId = users[0].user_id;
    console.log('Testing with user ID:', testUserId);

    // Test the exact queries from the API
    console.log('\n1. Testing workspace_members query...');
    const { data: userWorkspaces, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", testUserId);

    console.log('Workspace query result:', {
      userWorkspaces,
      workspaceError
    });

    if (workspaceError) {
      console.error('Workspace query failed:', workspaceError);
      return;
    }

    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];
    console.log('Workspace IDs:', workspaceIds);

    if (workspaceIds.length === 0) {
      console.log('No workspaces found for user');
      return;
    }

    console.log('\n2. Testing workspace members query...');
    const { data: workspaceMembers, error: membersError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .in("workspace_id", workspaceIds);

    console.log('Members query result:', {
      workspaceMembers,
      membersError
    });

    if (membersError) {
      console.error('Members query failed:', membersError);
      return;
    }

    const memberIds = Array.from(new Set(workspaceMembers?.map(wm => wm.user_id) || []));
    console.log('Member IDs:', memberIds);

    console.log('\n3. Testing user_profiles query...');
    const { data: userProfiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url, email")
      .in("user_id", memberIds);

    console.log('Profiles query result:', {
      userProfiles,
      profilesError
    });

    // Test auth.users access
    console.log('\n4. Testing auth.users access...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    console.log('Auth users result:', {
      userCount: authUsers?.users?.length || 0,
      authError
    });

    console.log('\nAll tests completed successfully!');

  } catch (error) {
    console.error('Test failed with exception:', error);
    console.error('Error stack:', error.stack);
  }
}

testWorkspaceUsersLogic();