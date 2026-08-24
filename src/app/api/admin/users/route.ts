import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin ? user : null
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Get all profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, name, target_score, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  // Get auth users to get emails (service role only)
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()

  const emailMap: Record<string, string> = {}
  for (const u of (authUsers || [])) {
    emailMap[u.id] = u.email || ''
  }

  const result = (profiles || []).map(p => ({
    ...p,
    email: emailMap[p.id] || '',
  }))

  return NextResponse.json<ApiResponse>({ data: result })
}

export async function PATCH(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Forbidden' }, { status: 403 })

  const { userId, is_admin } = await req.json()
  if (!userId || typeof is_admin !== 'boolean') {
    return NextResponse.json<ApiResponse>({ error: 'Invalid request' }, { status: 400 })
  }

  // Prevent removing own admin
  if (userId === user.id && !is_admin) {
    return NextResponse.json<ApiResponse>({ error: 'Tidak bisa hapus admin diri sendiri' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_admin })
    .eq('id', userId)

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse>({ data: { updated: true } })
}
