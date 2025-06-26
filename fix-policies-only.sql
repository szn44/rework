-- Fix RLS Policy Infinite Recursion - POLICIES ONLY
-- Run this in Supabase SQL Editor

-- Step 1: Drop problematic policies
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

-- Step 2: Create fixed, non-recursive policies

-- Organizations: Simple creator-based access
CREATE POLICY "Users can view their organizations" ON organizations 
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create organizations" ON organizations 
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their created organizations" ON organizations 
    FOR UPDATE USING (created_by = auth.uid());

-- Organization members: Creator can manage
CREATE POLICY "Users can view their own memberships" ON organization_members 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Organization creators can manage memberships" ON organization_members 
    FOR ALL USING (
        org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
    );

-- Workspaces: Based on organization ownership
CREATE POLICY "Users can view workspaces in their organizations" ON workspaces 
    FOR SELECT USING (
        org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
    );

CREATE POLICY "Users can create workspaces in their organizations" ON workspaces 
    FOR INSERT WITH CHECK (
        org_id IN (SELECT id FROM organizations WHERE created_by = auth.uid())
    );

-- Workspace members: Workspace creator control
CREATE POLICY "Users can view their workspace memberships" ON workspace_members 
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Workspace creators can manage members" ON workspace_members 
    FOR ALL USING (
        workspace_id IN (SELECT id FROM workspaces WHERE created_by = auth.uid())
    );

-- Issues: Based on workspace ownership or direct creation
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

-- Issue labels: Based on issue ownership
CREATE POLICY "Users can view labels on their issues" ON issue_labels 
    FOR SELECT USING (
        issue_id IN (SELECT id FROM issues WHERE created_by = auth.uid())
    );

CREATE POLICY "Users can manage labels on their issues" ON issue_labels 
    FOR ALL USING (
        issue_id IN (SELECT id FROM issues WHERE created_by = auth.uid())
    ); 