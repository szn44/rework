import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateOrganizationRequest } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organizations
    const { data: organizations, error } = await supabase
      .from("organization_members")
      .select(`
        role,
        organizations (
          id,
          name,
          slug,
          plan_type,
          created_at
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: organizations })
  } catch (error) {
    console.error('Error fetching organizations:', error)
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

    const body: CreateOrganizationRequest = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]{3,20}$/.test(slug)) {
      return NextResponse.json({ 
        error: "Slug must be 3-20 characters, lowercase letters, numbers, and hyphens only" 
      }, { status: 400 })
    }

    // Check if slug is already taken
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("slug")
      .eq("slug", slug)
      .single()

    if (existingOrg) {
      return NextResponse.json({ error: "Organization slug already taken" }, { status: 400 })
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        created_by: user.id,
        plan_type: 'free'
      })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        user_id: user.id,
        org_id: organization.id,
        role: 'owner',
        joined_at: new Date().toISOString()
      })

    if (memberError) {
      // Rollback organization creation
      await supabase.from("organizations").delete().eq("id", organization.id)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ data: organization }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 