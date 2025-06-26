-- Add spaces table for project tags within workspaces
CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6', -- Default blue color
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT spaces_slug_format CHECK (slug ~ '^[a-z0-9-]{2,30}$'),
    UNIQUE(workspace_id, slug)
);

-- Add space_id to issues table to link issues to spaces
ALTER TABLE issues ADD COLUMN space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_issues_space_id ON issues(space_id);
CREATE INDEX IF NOT EXISTS idx_spaces_workspace_id ON spaces(workspace_id);

-- Create default spaces for existing workspaces
INSERT INTO spaces (name, slug, description, color, workspace_id, created_by)
SELECT 
    'General' as name,
    'general' as slug,
    'Default space for general tasks and discussions' as description,
    '#6b7280' as color, -- Gray color for default space
    w.id as workspace_id,
    w.created_by
FROM workspaces w
WHERE NOT EXISTS (
    SELECT 1 FROM spaces s WHERE s.workspace_id = w.id
);

-- RLS Policies for spaces
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Users can view spaces in workspaces they are members of
CREATE POLICY "Users can view spaces in their workspaces" ON spaces 
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
        )
    );

-- Workspace members can create spaces
CREATE POLICY "Workspace members can create spaces" ON spaces 
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
        )
    );

-- Space creators and workspace admins can update spaces
CREATE POLICY "Space creators and workspace admins can update spaces" ON spaces 
    FOR UPDATE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.member_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Space creators and workspace admins can delete spaces
CREATE POLICY "Space creators and workspace admins can delete spaces" ON spaces 
    FOR DELETE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.member_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Update issues RLS policy to include space access
DROP POLICY IF EXISTS "Users can view their workspace issues" ON issues;
CREATE POLICY "Users can view their workspace issues" ON issues 
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
        )
    );

-- Update function to generate issue room IDs to include space info
CREATE OR REPLACE FUNCTION generate_liveblocks_room_id(workspace_slug TEXT, issue_num INTEGER, space_slug TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF space_slug IS NOT NULL THEN
        RETURN 'liveblocks:examples:nextjs-project-manager-' || workspace_slug || '-' || issue_num || '-' || space_slug;
    ELSE
        RETURN 'liveblocks:examples:nextjs-project-manager-' || workspace_slug || '-' || issue_num;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to include space info in room ID
CREATE OR REPLACE FUNCTION auto_populate_issue_fields()
RETURNS TRIGGER AS $$
DECLARE
    ws_slug TEXT;
    next_num INTEGER;
    space_slug TEXT;
    room_id TEXT;
BEGIN
    -- Get workspace slug
    SELECT slug INTO ws_slug FROM workspaces WHERE id = NEW.workspace_id;
    
    -- Get next issue number for this workspace
    next_num := get_next_issue_number(NEW.workspace_id);
    
    -- Get space slug if space_id is provided
    IF NEW.space_id IS NOT NULL THEN
        SELECT slug INTO space_slug FROM spaces WHERE id = NEW.space_id;
    END IF;
    
    -- Generate room ID
    room_id := generate_liveblocks_room_id(ws_slug, next_num, space_slug);
    
    -- Set the fields
    NEW.workspace_slug := ws_slug;
    NEW.issue_number := next_num;
    NEW.liveblocks_room_id := room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 