-- Create custom types for enums
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE member_type AS ENUM ('user', 'agent');
CREATE TYPE issue_status AS ENUM ('todo', 'progress', 'review', 'done');
CREATE TYPE issue_priority AS ENUM ('none', 'low', 'medium', 'high', 'urgent');

-- Enable RLS (Row Level Security)
ALTER DATABASE CURRENT SET row_security = on;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type plan_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]{3,20}$')
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, org_id)
);

-- Workspaces table  
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT workspaces_slug_format CHECK (slug ~ '^[A-Z0-9]{2,10}$'),
    UNIQUE(org_id, slug)
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_type member_type NOT NULL DEFAULT 'user',
    role member_role NOT NULL DEFAULT 'member',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, member_id)
);

-- Issues table with auto-incrementing issue numbers per workspace
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_slug TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    description TEXT,
    status issue_status NOT NULL DEFAULT 'todo',
    priority issue_priority NOT NULL DEFAULT 'none',
    assignee_ids UUID[] DEFAULT '{}',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    liveblocks_room_id TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, issue_number)
);

-- Issue labels table
CREATE TABLE IF NOT EXISTS issue_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(issue_id, label)
);

-- Future: Agents table (not implemented yet, but schema ready)
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    agent_brief_content TEXT,
    capabilities JSONB DEFAULT '{}',
    integrations TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Future: Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    credentials_encrypted TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(org_id, provider)
);

-- Future: Agent conversations table
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user' or 'agent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to auto-increment issue numbers per workspace
CREATE OR REPLACE FUNCTION get_next_issue_number(workspace_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(issue_number), 0) + 1
    INTO next_number
    FROM issues
    WHERE workspace_id = workspace_uuid;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate issue ID (workspace_slug-issue_number)
CREATE OR REPLACE FUNCTION generate_issue_id(workspace_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    ws_slug TEXT;
    issue_num INTEGER;
BEGIN
    SELECT slug INTO ws_slug FROM workspaces WHERE id = workspace_uuid;
    SELECT get_next_issue_number(workspace_uuid) INTO issue_num;
    
    RETURN ws_slug || '-' || issue_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set workspace_slug and issue_number on insert
CREATE OR REPLACE FUNCTION set_issue_identifiers()
RETURNS TRIGGER AS $$
DECLARE
    ws_slug TEXT;
BEGIN
    -- Get workspace slug
    SELECT slug INTO ws_slug FROM workspaces WHERE id = NEW.workspace_id;
    
    -- Set workspace_slug and issue_number if not already set
    IF NEW.workspace_slug IS NULL THEN
        NEW.workspace_slug = ws_slug;
    END IF;
    
    IF NEW.issue_number IS NULL THEN
        NEW.issue_number = get_next_issue_number(NEW.workspace_id);
    END IF;
    
    -- Auto-generate liveblocks room ID if not provided
    IF NEW.liveblocks_room_id IS NULL THEN
        NEW.liveblocks_room_id = 'liveblocks:examples:nextjs-project-manager-' || NEW.workspace_slug || '-' || NEW.issue_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_issue_identifiers
    BEFORE INSERT ON issues
    FOR EACH ROW
    EXECUTE FUNCTION set_issue_identifiers();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_org_id ON workspaces(org_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(org_id, slug);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_member_id ON workspace_members(member_id);
CREATE INDEX IF NOT EXISTS idx_issues_workspace_id ON issues(workspace_id);
CREATE INDEX IF NOT EXISTS idx_issues_workspace_slug ON issues(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_ids ON issues USING GIN(assignee_ids);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_created_by ON issues(created_by);
CREATE INDEX IF NOT EXISTS idx_issue_labels_issue_id ON issue_labels(issue_id);
CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON integrations(org_id); 