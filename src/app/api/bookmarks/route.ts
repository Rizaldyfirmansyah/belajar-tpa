import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, Bookmark } from '@/types'

const postSchema = z.object({ questionId: z.string().uuid() })

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, questions(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<Bookmark[]>>({ data: data as Bookmark[] || [] })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid body' }, { status: 400 })
  }

  const { questionId } = parsed.data

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, question_id: questionId })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json<ApiResponse>({ error: 'Already bookmarked' }, { status: 409 })
    }
    return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<{ id: string }>>({ data: { id: data.id } }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (questionId) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', questionId)

    if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })
    return NextResponse.json<ApiResponse>({ data: null })
  }

  return NextResponse.json<ApiResponse>({ error: 'questionId required' }, { status: 400 })
}
