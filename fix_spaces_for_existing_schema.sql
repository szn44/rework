-- Fix spaces table for existing schema (using team_id instead of workspace_id)

-- Add missing constraint for slug format if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spaces_slug_format'
    ) THEN
        ALTER TABLE spaces ADD CONSTRAINT spaces_slug_format CHECK (slug ~ '^[a-z0-9-]{2,30}$');
    END IF;
END $$;

-- Add unique constraint on team_id and slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spaces_team_id_slug_key'
    ) THEN
        ALTER TABLE spaces ADD CONSTRAINT spaces_team_id_slug_key UNIQUE(team_id, slug);
    END IF;
END $$;

-- Enable RLS for spaces
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view spaces in their workspaces" ON spaces;
DROP POLICY IF EXISTS "Workspace members can create spaces" ON spaces;
DROP POLICY IF EXISTS "Space creators and workspace admins can update spaces" ON spaces;
DROP POLICY IF EXISTS "Space creators and workspace admins can delete spaces" ON spaces;

-- Create RLS policies for spaces (using team_id column)
CREATE POLICY "Users can view spaces in their workspaces" ON spaces 
    FOR SELECT USING (
        team_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can create spaces" ON spaces 
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Space creators and workspace admins can update spaces" ON spaces 
    FOR UPDATE USING (
        created_by = auth.uid() OR
        team_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.user_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

CREATE POLICY "Space creators and workspace admins can delete spaces" ON spaces 
    FOR DELETE USING (
        created_by = auth.uid() OR
        team_id IN (
            SELECT wm.workspace_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.user_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing user_profiles policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);