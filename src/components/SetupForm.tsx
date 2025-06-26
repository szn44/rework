'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface SetupFormProps {
  user: User
}

export function SetupForm({ user }: SetupFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orgName: '',
    orgSlug: '',
    workspaceName: '',
    workspaceSlug: ''
  })

  const generateSlug = (name: string, isWorkspace: boolean = false) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, isWorkspace ? 10 : 20)
    
    return isWorkspace ? slug.toUpperCase() : slug
  }

  const handleOrgNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      orgName: name,
      orgSlug: generateSlug(name)
    }))
  }

  const handleWorkspaceNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      workspaceName: name,
      workspaceSlug: generateSlug(name, true)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create organization
      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.orgName,
          slug: formData.orgSlug,
        }),
      })

      const orgResult = await orgResponse.json()

      if (!orgResponse.ok) {
        throw new Error(orgResult.error || 'Failed to create organization')
      }

      // Create workspace
      const workspaceResponse = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.workspaceName,
          slug: formData.workspaceSlug,
          org_id: orgResult.data.id,
        }),
      })

      const workspaceResult = await workspaceResponse.json()

      if (!workspaceResponse.ok) {
        throw new Error(workspaceResult.error || 'Failed to create workspace')
      }

      // Redirect to main app
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            required
            value={formData.orgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="My Company"
          />
        </div>

        <div>
          <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700">
            Organization URL (slug)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              rework.com/
            </span>
            <input
              id="orgSlug"
              name="orgSlug"
              type="text"
              required
              value={formData.orgSlug}
              onChange={(e) => setFormData(prev => ({ ...prev, orgSlug: e.target.value }))}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="my-company"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">3-20 characters, lowercase letters, numbers, and hyphens only</p>
        </div>

        <div>
          <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700">
            First Workspace Name
          </label>
          <input
            id="workspaceName"
            name="workspaceName"
            type="text"
            required
            value={formData.workspaceName}
            onChange={(e) => handleWorkspaceNameChange(e.target.value)}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Design Team"
          />
        </div>

        <div>
          <label htmlFor="workspaceSlug" className="block text-sm font-medium text-gray-700">
            Workspace Code
          </label>
          <input
            id="workspaceSlug"
            name="workspaceSlug"
            type="text"
            required
            value={formData.workspaceSlug}
            onChange={(e) => setFormData(prev => ({ ...prev, workspaceSlug: e.target.value.toUpperCase() }))}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="DESIGN"
          />
          <p className="mt-1 text-xs text-gray-500">2-10 characters, uppercase letters and numbers only (used for issue IDs like DESIGN-123)</p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !formData.orgName || !formData.workspaceName}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Organization & Workspace'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Welcome, {user.email}! You can add team members and create more workspaces later.
        </p>
      </div>
    </form>
  )
} 