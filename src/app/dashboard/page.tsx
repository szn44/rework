import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user's organizations with member details
  const { data: orgMemberships } = await supabase
    .from("organization_members")
    .select(`
      role,
      joined_at,
      organizations (
        id,
        name,
        slug,
        plan_type,
        created_at
      )
    `)
    .eq("user_id", user.id)

  // Get user's workspaces
  const { data: workspaceMemberships } = await supabase
    .from("workspace_members")
    .select(`
      role,
      added_at,
      workspaces (
        id,
        name,
        slug,
        created_at,
        organizations (
          name,
          slug
        )
      )
    `)
    .eq("member_id", user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organizations */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Organizations
              </h3>
              <div className="space-y-4">
                {orgMemberships?.map((membership) => {
                  const org = membership.organizations as any
                  return (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-500">/{org.slug}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Role: {membership.role} • {org.plan_type} plan
                          </p>
                        </div>
                        <a
                          href={`/org/${org.slug}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  )
                })}
                {(!orgMemberships || orgMemberships.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No organizations yet</p>
                    <a
                      href="/setup"
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Create your first organization →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workspaces */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Workspaces
              </h3>
              <div className="space-y-4">
                {workspaceMemberships?.map((membership) => {
                  const workspace = membership.workspaces as any
                  const org = workspace?.organizations as any
                  return (
                    <div key={workspace.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{workspace.name}</h4>
                          <p className="text-sm text-gray-500">{workspace.slug}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {org?.name} • Role: {membership.role}
                          </p>
                        </div>
                        <a
                          href={`/spaces/${workspace.slug}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  )
                })}
                {(!workspaceMemberships || workspaceMemberships.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No workspaces yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Issues
            </a>
          </div>
          <div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 