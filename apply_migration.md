# Manual Database Migration Instructions

Since Supabase CLI is not connected, you need to manually apply the database migration to fix the setup issues.

## Step 1: Apply the Migration SQL

Go to your Supabase dashboard SQL editor and run the contents of:
`/supabase/migrations/004_remove_liveblocks_rooms.sql`

This adds the necessary columns and tables:
- `content` and `content_text` columns to `issues` table
- `issue_comments`, `comment_metadata`, `issue_presence`, `issue_activity` tables
- Real-time subscriptions
- Proper triggers and functions

## Step 2: Test the Setup Flow

After applying the migration:

1. Try accessing the app - you should be redirected to `/setup` if you don't have workspaces
2. Fill out the setup form with:
   - Workspace Name: "Test Team" 
   - This will auto-generate the slug "TESTTEAM"
3. Submit the form - it should create both an organization and workspace
4. You should be redirected to the main issues page

## Debug Information

The setup flow now:
1. Creates an organization first
2. Then creates a workspace under that organization
3. Adds the user as a member of both

If you still get redirected to setup, check the browser console for the debug logs that show:
- Whether workspace_members records exist
- The user ID being checked
- Any database errors

## Alternative: Quick Database Fix

If you want to skip the setup and manually create the workspace records, you can run this SQL in Supabase:

```sql
-- Insert test organization
INSERT INTO organizations (name, slug, created_by, plan_type) 
VALUES ('Test Org', 'test-org', 'YOUR_USER_ID_HERE', 'free');

-- Insert test workspace
INSERT INTO workspaces (name, slug, org_id, created_by)
VALUES ('Test Workspace', 'TEST', 
  (SELECT id FROM organizations WHERE slug = 'test-org'), 
  'YOUR_USER_ID_HERE');

-- Add user as workspace member
INSERT INTO workspace_members (workspace_id, member_id, role)
VALUES (
  (SELECT id FROM workspaces WHERE slug = 'TEST'),
  'YOUR_USER_ID_HERE',
  'admin'
);

-- Add user as organization member
INSERT INTO organization_members (user_id, org_id, role)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM organizations WHERE slug = 'test-org'),
  'owner'
);
```

Replace 'YOUR_USER_ID_HERE' with your actual user ID from the auth.users table.