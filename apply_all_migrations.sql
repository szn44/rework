-- Apply all pending migrations
-- Run this in your Supabase SQL Editor

-- Migration 003: Add spaces system
CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT spaces_slug_format CHECK (slug ~ '^[a-z0-9-]{2,30}$'),
    UNIQUE(workspace_id, slug)
);

-- Add space_id to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_issues_space_id ON issues(space_id);
CREATE INDEX IF NOT EXISTS idx_spaces_workspace_id ON spaces(workspace_id);

-- Enable RLS for spaces
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Migration 005: User profiles table
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

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- User can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Migration 007: Fix RLS policies for spaces (using user_id instead of member_id)
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