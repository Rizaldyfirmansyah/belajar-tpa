import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

const bodySchema = z.object({
  targetScore: z.number().int().min(200).max(800),
  // null = user belum tahu tanggal tesnya, dan itu tidak apa-apa.
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Invalid body' },
      { status: 400 }
    )
  }

  const { targetScore, testDate } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({
      target_score: targetScore,
      test_date: testDate ?? null,
      onboarded_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<{ ok: true }>>({ data: { ok: true } })
}
