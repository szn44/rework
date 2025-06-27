-- Fix RLS policies for spaces table to use correct column name (user_id instead of member_id)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view spaces in their workspaces" ON spaces;
DROP POLICY IF EXISTS "Workspace members can create spaces" ON spaces;
DROP POLICY IF EXISTS "Space creators and workspace admins can update spaces" ON spaces;
DROP POLICY IF EXISTS "Space creators and workspace admins can delete spaces" ON spaces;

-- Users can view spaces in workspaces they are members of
CREATE POLICY "Users can view spaces in their workspaces" ON spaces 
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- Workspace members can create spaces
CREATE POLICY "Workspace members can create spaces" ON spaces 
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- Space creators and workspace admins can update spaces
CREATE POLICY "Space creators and workspace admins can update spaces" ON spaces 
    FOR UPDATE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.user_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Space creators and workspace admins can delete spaces
CREATE POLICY "Space creators and workspace admins can delete spaces" ON spaces 
    FOR DELETE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.user_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Also fix the issues RLS policy that was updated in the spaces migration
DROP POLICY IF EXISTS "Users can view their workspace issues" ON issues;
CREATE POLICY "Users can view their workspace issues" ON issues 
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );