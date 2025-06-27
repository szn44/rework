const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMembershipCorrected() {
  try {
    console.log('Fixing workspace membership with correct column names...')
    
    // Get users and workspaces
    const { data: users } = await supabase.auth.admin.listUsers()
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
    
    console.log('Available users:', users.users.map(u => ({ id: u.id, email: u.email })))
    console.log('Available workspaces:', workspaces?.map(w => ({ id: w.id, slug: w.slug, name: w.name })))
    
    if (users.users.length > 0 && workspaces && workspaces.length > 0) {
      const user = users.users[0] // First user
      const workspace = workspaces[0] // First workspace
      
      console.log(`\nCreating membership for ${user.email} in workspace ${workspace.slug}`)
      
      // Create workspace membership with correct column names
      const { data: newMember, error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id, // Using user_id instead of member_id
          role: 'admin'
        })
        .select()
      
      if (memberError) {
        console.log('Error creating workspace membership:', memberError)
      } else {
        console.log('✅ Workspace membership created successfully!')
      }
    }
    
    // Check final state
    const { data: finalMembers } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        workspaces (
          id,
          slug,
          name
        )
      `)
    
    console.log('\n📊 Final workspace memberships:')
    finalMembers?.forEach(member => {
      console.log(`  User ${member.user_id} (${member.role}) → Workspace ${member.workspaces?.slug} (${member.workspaces?.name})`)
    })
    
    if (finalMembers && finalMembers.length > 0) {
      console.log('\n🎉 Setup redirect should now work! Try accessing the app.')
      console.log('You should no longer be redirected to /setup')
    } else {
      console.log('\n⚠️  Still no memberships. Something went wrong.')
    }
    
  } catch (error) {
    console.error('Fix failed:', error)
  }
}

fixMembershipCorrected()