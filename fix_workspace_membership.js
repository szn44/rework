const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixWorkspaceMembership() {
  try {
    console.log('Checking and fixing workspace membership...')
    
    // Check what exists
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
    
    const { data: organizations } = await supabase
      .from('organizations')
      .select('*')
    
    const { data: members } = await supabase
      .from('workspace_members')
      .select('*')
    
    console.log('Current state:')
    console.log('- Organizations:', organizations?.length || 0)
    console.log('- Workspaces:', workspaces?.length || 0) 
    console.log('- Workspace members:', members?.length || 0)
    
    if (workspaces && workspaces.length > 0) {
      console.log('\nWorkspaces exist but no memberships. Creating membership...')
      
      // Get the first user (you)
      const { data: users } = await supabase.auth.admin.listUsers()
      const firstUser = users.users[0]
      const firstWorkspace = workspaces[0]
      
      console.log(`Creating membership for user ${firstUser.email} in workspace ${firstWorkspace.slug}`)
      
      // Create workspace membership
      const { data: newMember, error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: firstWorkspace.id,
          member_id: firstUser.id,
          member_type: 'user',
          role: 'admin'
        })
        .select()
      
      if (memberError) {
        console.log('Error creating workspace membership:', memberError)
      } else {
        console.log('✅ Workspace membership created successfully!')
        
        // Also create organization membership if organizations exist
        if (organizations && organizations.length > 0) {
          const { error: orgMemberError } = await supabase
            .from('organization_members')
            .insert({
              user_id: firstUser.id,
              org_id: organizations[0].id,
              role: 'owner'
            })
          
          if (!orgMemberError) {
            console.log('✅ Organization membership created successfully!')
          }
        }
      }
    } else {
      console.log('\nNo workspaces exist. You need to go through the setup flow.')
      console.log('The setup form should work now with the fixed organization creation.')
    }
    
    // Final check
    const { data: finalMembers } = await supabase
      .from('workspace_members')
      .select(`
        member_id,
        workspaces (
          id,
          slug,
          name
        )
      `)
    
    console.log('\nFinal workspace memberships:')
    finalMembers?.forEach(member => {
      console.log(`  User ${member.member_id} → Workspace ${member.workspaces?.slug}`)
    })
    
    if (finalMembers && finalMembers.length > 0) {
      console.log('\n🎉 Setup redirect should now work! Try accessing the app.')
    } else {
      console.log('\n⚠️  Still no memberships. Go to /setup to create your first workspace.')
    }
    
  } catch (error) {
    console.error('Fix failed:', error)
  }
}

fixWorkspaceMembership()