import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TOPICS } from '@/lib/constants'
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

export async function GET(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const subtest = searchParams.get('subtest') || ''
  const topic = searchParams.get('topic') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const admin = createAdminClient()

  let query = admin
    .from('questions')
    .select(
      'id, subtest, topic, question, options, answer, explanation, difficulty, question_type, image_url, options_images, explanation_image_url, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (subtest) query = query.eq('subtest', subtest)
  if (topic) query = query.eq('topic', topic)
  if (search) query = query.ilike('question', `%${search}%`)

  const { data, count, error } = await query.range(offset, offset + limit - 1)
  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  // Topic counts
  const { data: topicCounts } = await admin.from('questions').select('topic')
  const counts: Record<string, number> = {}
  for (const row of (topicCounts || [])) {
    counts[row.topic] = (counts[row.topic] || 0) + 1
  }

  return NextResponse.json({ data: { questions: data, total: count, counts } })
}

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { subtest, topic, question, options, answer, explanation, difficulty, image_url, options_images, explanation_image_url } = body

  if (!subtest || !topic || !options || !answer) {
    return NextResponse.json<ApiResponse>({ error: 'Field tidak lengkap' }, { status: 400 })
  }
  if (!question?.trim() && !image_url) {
    return NextResponse.json<ApiResponse>({ error: 'Teks soal atau gambar harus diisi' }, { status: 400 })
  }

  const topicConfig = TOPICS.find(t => t.id === topic)
  if (!topicConfig) return NextResponse.json<ApiResponse>({ error: 'Topik tidak valid' }, { status: 400 })
  if (topicConfig.subtest !== subtest) return NextResponse.json<ApiResponse>({ error: 'Subtest tidak cocok' }, { status: 400 })

  if (!['A', 'B', 'C', 'D', 'E'].includes(answer)) {
    return NextResponse.json<ApiResponse>({ error: 'Jawaban harus A-E' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('questions')
    .insert({
      subtest,
      topic,
      question_type: image_url ? 'image' : 'text',
      question: question?.trim() || null,
      options,
      answer,
      explanation: explanation?.trim() || '',
      difficulty: difficulty || 'medium',
      image_url: image_url || null,
      options_images: options_images || null,
      explanation_image_url: explanation_image_url || null,
      is_validated: true,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse>({ data })
}
