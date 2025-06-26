-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they are members of" ON organizations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = organizations.id
        )
    );

CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Organization owners can update their organizations" ON organizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = organizations.id AND role = 'owner'
        )
    );

CREATE POLICY "Organization owners can delete their organizations" ON organizations
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = organizations.id AND role = 'owner'
        )
    );

-- Organization members policies
CREATE POLICY "Users can view organization members for orgs they belong to" ON organization_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members om2 
            WHERE om2.org_id = organization_members.org_id
        )
    );

CREATE POLICY "Organization owners and admins can invite members" ON organization_members
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = organization_members.org_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can join organizations they were invited to" ON organization_members
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organization owners and admins can manage members" ON organization_members
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members om2
            WHERE om2.org_id = organization_members.org_id 
            AND om2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Organization owners and admins can remove members" ON organization_members
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members om2
            WHERE om2.org_id = organization_members.org_id 
            AND om2.role IN ('owner', 'admin')
        ) OR auth.uid() = user_id -- Users can remove themselves
    );

-- Workspaces policies  
CREATE POLICY "Users can view workspaces in their organizations" ON workspaces
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = workspaces.org_id
        )
    );

CREATE POLICY "Organization members can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = workspaces.org_id
        )
    );

CREATE POLICY "Workspace creators and org admins can update workspaces" ON workspaces
    FOR UPDATE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = workspaces.org_id AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace creators and org admins can delete workspaces" ON workspaces
    FOR DELETE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = workspaces.org_id AND role IN ('owner', 'admin')
        )
    );

-- Workspace members policies
CREATE POLICY "Users can view workspace members for workspaces they belong to" ON workspace_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT member_id FROM workspace_members wm2
            WHERE wm2.workspace_id = workspace_members.workspace_id
        )
    );

CREATE POLICY "Workspace members with admin role can add members" ON workspace_members
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = workspace_members.workspace_id 
            AND (wm.role IN ('admin') OR w.created_by = auth.uid())
        )
    );

CREATE POLICY "Workspace admins can manage members" ON workspace_members
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = workspace_members.workspace_id 
            AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

CREATE POLICY "Workspace admins can remove members" ON workspace_members
    FOR DELETE USING (
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = workspace_members.workspace_id 
            AND (wm.role = 'admin' OR w.created_by = auth.uid())
        ) OR auth.uid() = member_id -- Users can remove themselves
    );

-- Issues policies
CREATE POLICY "Users can view issues in workspaces they belong to" ON issues
    FOR SELECT USING (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = issues.workspace_id
        )
    );

CREATE POLICY "Workspace members can create issues" ON issues
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = issues.workspace_id
        )
    );

CREATE POLICY "Workspace members can update issues" ON issues
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = issues.workspace_id
        )
    );

CREATE POLICY "Issue creators and workspace admins can delete issues" ON issues
    FOR DELETE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = issues.workspace_id 
            AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Issue labels policies
CREATE POLICY "Users can view labels for issues they can access" ON issue_labels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues i
            JOIN workspace_members wm ON wm.workspace_id = i.workspace_id
            WHERE i.id = issue_labels.issue_id AND wm.member_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage issue labels" ON issue_labels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM issues i
            JOIN workspace_members wm ON wm.workspace_id = i.workspace_id
            WHERE i.id = issue_labels.issue_id AND wm.member_id = auth.uid()
        )
    );

-- Agents policies (future)
CREATE POLICY "Users can view agents in workspaces they belong to" ON agents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = agents.workspace_id
        )
    );

CREATE POLICY "Workspace members can create agents" ON agents
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = agents.workspace_id
        )
    );

CREATE POLICY "Agent creators and workspace admins can update agents" ON agents
    FOR UPDATE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = agents.workspace_id 
            AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

CREATE POLICY "Agent creators and workspace admins can delete agents" ON agents
    FOR DELETE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT wm.member_id FROM workspace_members wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.workspace_id = agents.workspace_id 
            AND (wm.role = 'admin' OR w.created_by = auth.uid())
        )
    );

-- Integrations policies (future)
CREATE POLICY "Organization members can view integrations" ON integrations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = integrations.org_id
        )
    );

CREATE POLICY "Organization owners and admins can manage integrations" ON integrations
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE org_id = integrations.org_id AND role IN ('owner', 'admin')
        )
    );

-- Agent conversations policies (future)
CREATE POLICY "Users can view their own agent conversations" ON agent_conversations
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = agent_conversations.workspace_id
        )
    );

CREATE POLICY "Workspace members can create agent conversations" ON agent_conversations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT member_id FROM workspace_members 
            WHERE workspace_id = agent_conversations.workspace_id
        )
    ); 