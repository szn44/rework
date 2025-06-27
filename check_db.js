const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDatabase() {
  try {
    console.log('Checking database connection...')
    
    // Check if issues table exists and what columns it has
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .limit(1)
    
    if (issuesError) {
      console.log('Issues table query error:', issuesError)
    } else {
      console.log('Issues table exists. Sample record keys:', issues[0] ? Object.keys(issues[0]) : 'No records')
    }
    
    // Check if issue_comments table exists (new table from migration)
    const { data: comments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .limit(1)
    
    if (commentsError) {
      console.log('issue_comments table does not exist yet:', commentsError.message)
    } else {
      console.log('issue_comments table exists!')
    }
    
    // Check workspace_members table
    const { data: workspaceMembers, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .limit(5)
    
    if (membersError) {
      console.log('workspace_members error:', membersError)
    } else {
      console.log('workspace_members records:', workspaceMembers?.length || 0)
      console.log('Sample workspace member:', workspaceMembers?.[0])
    }
    
    // Check users in auth table
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('Users error:', usersError)
    } else {
      console.log('Number of users:', users.users?.length || 0)
      console.log('First user ID:', users.users?.[0]?.id)
    }
    
  } catch (error) {
    console.error('Database check failed:', error)
  }
}

checkDatabase()