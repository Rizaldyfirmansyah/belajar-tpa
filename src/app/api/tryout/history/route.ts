import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, TryoutSession } from '@/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tryout_sessions')
    .select('id, status, score_final, score_verbal, score_numerik, score_penalaran, attempt_number, started_at, completed_at, duration_seconds')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<TryoutSession[]>>({ data: data as TryoutSession[] || [] })
}
