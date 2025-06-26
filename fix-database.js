#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yfhbvwbdrmsyruuvvbhj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = 'sbp_b31afa7915f33ddb07211815286baa63d52796ff';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('Please add it to your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixDatabase() {
  console.log('🔧 Fixing database RLS policies...');
  
  try {
    // Step 1: Drop problematic policies
    console.log('📝 Dropping problematic policies...');
    
    const dropPolicies = `
      -- Drop all existing policies to fix infinite recursion
      DROP POLICY IF EXISTS "Users can view organizations they are members of" ON organizations;
      DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
      DROP POLICY IF EXISTS "Organization owners/admins can update organizations" ON organizations;
      DROP POLICY IF EXISTS "Users can view organization memberships they are part of" ON organization_members;
      DROP POLICY IF EXISTS "Organization owners/admins can manage memberships" ON organization_members;
      DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
      DROP POLICY IF EXISTS "Organization members can create workspaces" ON workspaces;
      DROP POLICY IF EXISTS "Users can view workspace memberships they are part of" ON workspace_members;
      DROP POLICY IF EXISTS "Workspace admins can manage memberships" ON workspace_members;
      DROP POLICY IF EXISTS "Users can view issues in workspaces they are members of" ON issues;
      DROP POLICY IF EXISTS "Workspace members can create issues" ON issues;
      DROP POLICY IF EXISTS "Issue creators and workspace members can update issues" ON issues;
      DROP POLICY IF EXISTS "Users can view issue labels for accessible issues" ON issue_labels;
      DROP POLICY IF EXISTS "Workspace members can manage issue labels" ON issue_labels;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Error dropping policies:', dropError);
      return;
    }
    
    console.log('✅ Dropped old policies');
    
    // Step 2: Create fixed policies
    console.log('📝 Creating fixed policies...');
    
    const createPolicies = `
      -- Simple, non-recursive policies
      
      -- Organizations: Allow users to see orgs they created or are explicitly members of
      CREATE POLICY "Users can view their organizations" ON organizations 
          FOR SELECT USING (created_by = auth.uid());
      
      CREATE POLICY "Users can create organizations" ON organizations 
          FOR INSERT WITH CHECK (created_by = auth.uid());
      
      CREATE POLICY "Users can update their created organizations" ON organizations 
          FOR UPDATE USING (created_by = auth.uid());
      
      -- Organization members: Simple access control
      CREATE POLICY "Users can view their own memberships" ON organization_members 
          FOR SELECT USING (user_id = auth.uid());
      
      CREATE POLICY "Organization creators can manage memberships" ON organization_members 
          FOR ALL USING (
              org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
          );
      
      -- Workspaces: Allow access based on organization ownership
      CREATE POLICY "Users can view workspaces in their organizations" ON workspaces 
          FOR SELECT USING (
              org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
          );
      
      CREATE POLICY "Users can create workspaces in their organizations" ON workspaces 
          FOR INSERT WITH CHECK (
              org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
          );
      
      -- Workspace members: Simple access control
      CREATE POLICY "Users can view their workspace memberships" ON workspace_members 
          FOR SELECT USING (member_id = auth.uid());
      
      CREATE POLICY "Workspace creators can manage members" ON workspace_members 
          FOR ALL USING (
              workspace_id IN (SELECT id FROM workspaces WHERE created_by = auth.uid())
          );
      
      -- Issues: Allow access based on workspace membership
      CREATE POLICY "Users can view their workspace issues" ON issues 
          FOR SELECT USING (
              workspace_id IN (SELECT id FROM workspaces WHERE created_by = auth.uid()) OR
              created_by = auth.uid()
          );
      
      CREATE POLICY "Users can create issues in their workspaces" ON issues 
          FOR INSERT WITH CHECK (
              workspace_id IN (SELECT id FROM workspaces WHERE created_by = auth.uid()) OR
              created_by = auth.uid()
          );
      
      CREATE POLICY "Users can update their issues" ON issues 
          FOR UPDATE USING (
              workspace_id IN (SELECT id FROM workspaces WHERE created_by = auth.uid()) OR
              created_by = auth.uid()
          );
      
      -- Issue labels: Allow access based on issue ownership
      CREATE POLICY "Users can view labels on their issues" ON issue_labels 
          FOR SELECT USING (
              issue_id IN (SELECT id FROM issues WHERE created_by = auth.uid())
          );
      
      CREATE POLICY "Users can manage labels on their issues" ON issue_labels 
          FOR ALL USING (
              issue_id IN (SELECT id FROM issues WHERE created_by = auth.uid())
          );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
    if (createError) {
      console.error('❌ Error creating policies:', createError);
      return;
    }
    
    console.log('✅ Created fixed policies');
    console.log('🎉 Database fixed! You can now create organizations.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecFunction() {
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  const { error } = await supabase.rpc('sql', { query: createFunction });
  if (error && !error.message.includes('already exists')) {
    console.log('Note: Could not create exec function, will try direct SQL execution');
  }
}

async function main() {
  console.log('🚀 Starting database fix...');
  await createExecFunction();
  await fixDatabase();
}

main().catch(console.error); 