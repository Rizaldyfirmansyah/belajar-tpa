import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

const bodySchema = z.object({
  kind: z.enum(['saran', 'bug', 'lainnya']).default('saran'),
  message: z.string().trim().min(5, 'Pesan terlalu pendek').max(2000),
  page: z.string().max(200).optional(),
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

  const { kind, message, page } = parsed.data

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    kind,
    message,
    page: page ?? null,
  })

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<{ ok: true }>>({ data: { ok: true } })
}
