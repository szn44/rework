const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  try {
    console.log('Checking actual table schemas...')
    
    // Get a sample workspace_members record to see actual column names
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .limit(1)
    
    if (membersError) {
      console.log('workspace_members error:', membersError)
    } else {
      console.log('workspace_members sample record columns:', members[0] ? Object.keys(members[0]) : 'No records')
    }
    
    // Check workspaces table
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1)
    
    console.log('workspaces sample record columns:', workspaces?.[0] ? Object.keys(workspaces[0]) : 'No records')
    
    // Check organizations table  
    const { data: orgs } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    console.log('organizations sample record columns:', orgs?.[0] ? Object.keys(orgs[0]) : 'No records')
    
  } catch (error) {
    console.error('Schema check failed:', error)
  }
}

checkSchema()