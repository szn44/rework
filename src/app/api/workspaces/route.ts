import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateWorkspaceRequest } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')

    // Get user's workspaces
    const query = supabase
      .from("workspace_members")
      .select(`
        role,
        workspaces (
          id,
          name,
          slug,
          created_at,
          organizations (
            id,
            name,
            slug
          )
        )
      `)
      .eq("user_id", user.id)

    // Filter by organization if specified
    if (orgId) {
      query.eq("workspaces.org_id", orgId)
    }

    const { data: workspaces, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: workspaces })
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: CreateWorkspaceRequest = await request.json()
    const { name, slug, org_id } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Validate slug format (uppercase for workspace slugs)
    if (!/^[A-Z0-9]{2,10}$/.test(slug)) {
      return NextResponse.json({ 
        error: "Workspace slug must be 2-10 characters, uppercase letters and numbers only" 
      }, { status: 400 })
    }

    // Check if workspace slug is already taken globally (since no org_id for now)
    const { data: existingWorkspace } = await supabase
      .from("workspaces")
      .select("slug")
      .eq("slug", slug)
      .single()

    if (existingWorkspace) {
      return NextResponse.json({ error: "Workspace slug already taken" }, { status: 400 })
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name,
        slug,
        created_by: user.id
      })
      .select()
      .single()

    if (workspaceError) {
      return NextResponse.json({ error: workspaceError.message }, { status: 500 })
    }

    // Add creator as member
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'admin' // Workspace creator gets admin role
      })

    if (memberError) {
      // Rollback workspace creation
      await supabase.from("workspaces").delete().eq("id", workspace.id)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ data: workspace }, { status: 201 })
  } catch (error) {
    console.error('Error creating workspace:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 