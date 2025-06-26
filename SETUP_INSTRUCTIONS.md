# Rework Project Management - Team Workspaces Setup

This guide will help you set up the new authentication and team workspace system for the Rework project management application.

## Prerequisites

- Node.js 18+ installed
- A Supabase project
- Google OAuth credentials (for authentication)

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 1.2 Set up Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

### 1.3 Run Database Migrations

1. Copy the SQL from `supabase/migrations/001_initial_schema.sql`
2. In Supabase Dashboard > SQL Editor, run the schema creation script
3. Copy the SQL from `supabase/migrations/002_rls_policies.sql`
4. Run the RLS policies script

## Step 2: Environment Configuration

Update your `.env.local` file with the following variables:

```env
# Existing Liveblocks Configuration
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
LIVEBLOCKS_PROJECT_ID=your_liveblocks_project_id

# OpenAI API Key for AI Assistant
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these values from:
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase Dashboard > Settings > API
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase Dashboard > Settings > API  
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard > Settings > API (keep this secret!)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Application

```bash
npm run dev
```

## Step 5: First Time Setup

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Sign in with Google or create an account with email/password
4. Complete the organization and workspace setup form
5. Start creating issues in your new workspace!

## Database Schema Overview

The application now uses a multi-tenant database structure:

### Core Tables

- **organizations**: Top-level containers for teams/companies
- **organization_members**: User membership in organizations
- **workspaces**: Project spaces within organizations (like "Design Team", "Engineering")
- **workspace_members**: User membership in workspaces
- **issues**: Tasks/issues scoped to workspaces with auto-generated IDs (e.g., DESIGN-123)

### Future-Ready Tables

- **agents**: AI agents that can be assigned to tasks (schema ready, not implemented)
- **integrations**: Third-party service connections
- **agent_conversations**: Chat history with AI agents

## Key Features

### 🔐 **Secure Authentication**
- Google OAuth and email/password support
- Row-level security (RLS) for multi-tenant data isolation
- Automatic user session management

### 🏢 **Organization Management**
- Create and manage organizations
- Role-based permissions (owner, admin, member)
- Unique organization slugs for URLs

### 🚀 **Workspace System**
- Multiple workspaces per organization
- Workspace-specific issue tracking
- Auto-generated issue IDs (e.g., DESIGN-123, ENG-456)

### 🔗 **Liveblocks Integration**
- Secure room access based on workspace membership
- Real-time collaboration maintained
- Automatic room creation for new issues

### 🤖 **Future AI Integration**
- Database schema ready for AI agents
- Agents can be assigned to tasks like team members
- Workspace-scoped agent management

## API Endpoints

### Authentication
- `POST /api/auth/logout` - Sign out user

### Organizations  
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace

### Issues
- `POST /api/create-issue` - Create new issue (updated for workspace system)

### Liveblocks
- `POST /api/liveblocks-auth` - Secure authentication for real-time collaboration

## Workspace Issue ID System

Issues now have predictable, meaningful IDs:

- **Format**: `{WORKSPACE_SLUG}-{NUMBER}`
- **Examples**: 
  - `DESIGN-1`, `DESIGN-2`, `DESIGN-3`
  - `ENG-1`, `ENG-2`, `ENG-3`
  - `MARKETING-1`, `MARKETING-2`

Numbers auto-increment per workspace, making it easy to reference issues in conversations.

## Row-Level Security (RLS)

All data is automatically secured with RLS policies:

- Users can only see organizations they're members of
- Workspace access is restricted to members
- Issues are scoped to workspace membership
- Future agents will be scoped to their workspaces

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check your Supabase environment variables
2. **Google OAuth not working**: Verify redirect URIs in Google Cloud Console
3. **Database errors**: Ensure RLS policies are properly applied
4. **Liveblocks connection issues**: Check that room naming matches the new workspace pattern

### Development Tips

1. Use the `/dashboard` page to see your organizations and workspaces
2. Check Supabase logs for database errors
3. Monitor the browser console for authentication issues
4. Use the `/setup` page if you need to create a new organization

## Migration from Previous Version

The application will automatically handle the transition:

1. Existing users will be redirected to `/setup` to create their first organization
2. Old Liveblocks rooms will still be accessible but not visible in the new UI
3. New issues will use the workspace-based ID system
4. Existing data in Liveblocks rooms is preserved

## Next Steps

Once set up, you can:

1. **Invite team members** to organizations (feature ready for implementation)
2. **Create multiple workspaces** for different teams/projects  
3. **Set up Google OAuth** for seamless team authentication
4. **Prepare for AI agents** - the database schema is ready
5. **Add integrations** - Stripe billing, Slack notifications, etc.

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Supabase connection in the dashboard
3. Ensure all environment variables are set correctly
4. Check Supabase logs for database-related issues

The application is now ready for team collaboration with a solid foundation for future AI agent integration! 