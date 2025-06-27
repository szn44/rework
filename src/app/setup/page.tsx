import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SetupForm } from '@/components/SetupForm'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user already has workspaces
  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspace_members")
    .select(`
      workspaces (
        id,
        slug
      )
    `)
    .eq("user_id", user.id)

  // If user has workspaces, redirect to main app
  if (workspaces && workspaces.length > 0 && workspaces.some(w => w.workspaces)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Rework
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get you started by creating your first workspace
          </p>
        </div>
        
        <SetupForm user={user} />
      </div>
    </div>
  )
} 