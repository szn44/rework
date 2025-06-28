// Import Supabase generated types (will be generated later)
// These are placeholder types until Supabase types are generated
export type Database = any;
type Enums<T extends string> = any;
type InsertTables<T extends string> = any;
type UpdateTables<T extends string> = any;

// Placeholder table types
type Organization = any;
type OrganizationMember = any;
type Workspace = any;
type WorkspaceMember = any;
type Issue = any;
type IssueLabel = any;
type Agent = any;
type Integration = any;
type AgentConversation = any;

// Basic request/response types for APIs
export interface CreateOrganizationRequest {
  name: string
  slug: string
}

export interface CreateWorkspaceRequest {
  name: string
  slug: string
  org_id: string
}

export interface CreateIssueRequest {
  title?: string
  description?: string
  status?: 'todo' | 'progress' | 'review' | 'done'
  priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  assignee_ids?: string[]
  workspace_id: string
  space_id?: string
}

// Enums
export type PlanType = Enums<'plan_type'>
export type MemberRole = Enums<'member_role'>
export type MemberType = Enums<'member_type'>
export type IssueStatus = Enums<'issue_status'>
export type IssuePriority = Enums<'issue_priority'>

// Insert types
export type InsertOrganization = InsertTables<'organizations'>
export type InsertOrganizationMember = InsertTables<'organization_members'>
export type InsertWorkspace = InsertTables<'workspaces'>
export type InsertWorkspaceMember = InsertTables<'workspace_members'>
export type InsertIssue = InsertTables<'issues'>
export type InsertIssueLabel = InsertTables<'issue_labels'>
export type InsertAgent = InsertTables<'agents'>
export type InsertIntegration = InsertTables<'integrations'>
export type InsertAgentConversation = InsertTables<'agent_conversations'>

// Update types
export type UpdateOrganization = UpdateTables<'organizations'>
export type UpdateOrganizationMember = UpdateTables<'organization_members'>
export type UpdateWorkspace = UpdateTables<'workspaces'>
export type UpdateWorkspaceMember = UpdateTables<'workspace_members'>
export type UpdateIssue = UpdateTables<'issues'>
export type UpdateIssueLabel = UpdateTables<'issue_labels'>
export type UpdateAgent = UpdateTables<'agents'>
export type UpdateIntegration = UpdateTables<'integrations'>
export type UpdateAgentConversation = UpdateTables<'agent_conversations'>

// Extended types with relations
export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[]
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[]
  organization: Organization
}

export interface IssueWithDetails extends Issue {
  labels: IssueLabel[]
  workspace: Workspace
  assignees?: Array<{ id: string; name: string; email: string }>
}

// User profile type (extends Supabase auth.users)
export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

// Authentication context types
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

// Liveblocks integration types
export interface LiveblocksUser {
  id: string
  info: {
    name: string
    avatar: string
    email: string
  }
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Invite types
export interface InviteUserRequest {
  email: string
  role: 'owner' | 'admin' | 'member'
  org_id?: string
  workspace_id?: string
}

// Workspace context types
export interface WorkspaceContext {
  organization: Organization
  workspace: Workspace
  userRole: MemberRole
  workspaces: Workspace[]
}

// Navigation context types  
export interface NavigationContextType {
  currentView: 'list' | 'board'
  setCurrentView: (view: 'list' | 'board') => void
  goBack: () => void
  isHydrated: boolean
}

// Issue filters and sorting
export interface IssueFilters {
  status?: string[]
  priority?: string[]
  assignee_ids?: string[]
  search?: string
}

export interface IssueSortOptions {
  field: 'created_at' | 'updated_at' | 'priority' | 'title'
  direction: 'asc' | 'desc'
} 