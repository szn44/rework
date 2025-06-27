const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function manualMigration() {
  try {
    console.log('Starting manual migration...')
    
    // Step 1: Add content columns to issues table (if they don't exist)
    console.log('\n1. Checking if content columns exist in issues table...')
    
    const { data: issueWithContent, error: contentError } = await supabase
      .from('issues')
      .select('content, content_text')
      .limit(1)
    
    if (contentError) {
      console.log('❌ Content columns missing. You need to run this SQL manually in Supabase dashboard:')
      console.log(`
-- Add content columns to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS content_text TEXT DEFAULT '';
      `)
    } else {
      console.log('✅ Content columns already exist in issues table')
    }
    
    // Step 2: Check workspace membership for debugging
    console.log('\n2. Debugging workspace membership...')
    
    const { data: users } = await supabase.auth.admin.listUsers()
    console.log('Available users:', users.users.map(u => ({ id: u.id, email: u.email })))
    
    const { data: workspaceMembers } = await supabase
      .from('workspace_members')
      .select(`
        member_id,
        workspaces (
          id,
          slug,
          name
        )
      `)
    
    console.log('Workspace memberships:')
    workspaceMembers?.forEach(member => {
      console.log(`  User ${member.member_id} → Workspace ${member.workspaces?.slug}`)
    })
    
    // Step 3: Check if any user has proper workspace access
    const { data: workspacesWithMembers } = await supabase
      .from('workspace_members')
      .select(`
        workspaces (
          id,
          slug
        )
      `)
    
    console.log('\n3. Summary of workspace setup:')
    console.log('Total workspace memberships:', workspaceMembers?.length || 0)
    console.log('Total users:', users.users?.length || 0)
    
    if (workspaceMembers && workspaceMembers.length > 0) {
      console.log('✅ Workspace memberships exist - setup redirect should work')
      const firstMember = workspaceMembers[0]
      console.log(`First user ${firstMember.member_id} has access to workspace ${firstMember.workspaces?.slug}`)
    } else {
      console.log('❌ No workspace memberships found - this explains the setup redirect')
    }
    
    // Step 4: Provide SQL to create missing tables
    console.log('\n4. SQL to run manually in Supabase dashboard SQL editor:')
    console.log(`
-- Add content columns to issues table (run this first)
ALTER TABLE issues ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS content_text TEXT DEFAULT '';

-- Create issue_comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    thread_id UUID REFERENCES issue_comments(id) ON DELETE CASCADE,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);

-- Enable RLS
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view comments on issues they can access" ON issue_comments 
    FOR SELECT USING (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        )
    );
`)
    
  } catch (error) {
    console.error('Manual migration check failed:', error)
  }
}

manualMigration()