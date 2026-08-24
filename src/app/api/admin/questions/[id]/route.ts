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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Delete child rows first
  await admin.from('drill_answers').delete().eq('question_id', params.id)
  await admin.from('tryout_answers').delete().eq('question_id', params.id)
  await admin.from('bookmarks').delete().eq('question_id', params.id)

  const { error } = await admin.from('questions').delete().eq('id', params.id)
  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse>({ data: { deleted: true } })
}
