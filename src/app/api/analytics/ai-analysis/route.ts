import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOverallAnalysis } from '@/lib/groq/analyzers/overall'
import type { ApiResponse, DashboardMetrics } from '@/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  // Check cache
  const { data: cache } = await supabase
    .from('ai_analysis_cache')
    .select('analysis_text, expires_at')
    .eq('user_id', user.id)
    .single()

  if (cache && new Date(cache.expires_at) > new Date()) {
    return NextResponse.json<ApiResponse<{ text: string; cached: boolean }>>({
      data: { text: cache.analysis_text, cached: true },
    })
  }

  // Fetch metrics
  const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/dashboard`, {
    headers: { Cookie: '' },
  })

  let metrics: DashboardMetrics | null = null
  if (metricsRes.ok) {
    const json = await metricsRes.json()
    metrics = json.data
  }

  if (!metrics) {
    return NextResponse.json<ApiResponse>({ error: 'Failed to fetch metrics' }, { status: 500 })
  }

  const text = await generateOverallAnalysis(metrics)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  await supabase.from('ai_analysis_cache').upsert({
    user_id: user.id,
    analysis_text: text,
    generated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  })

  return NextResponse.json<ApiResponse<{ text: string; cached: boolean }>>({
    data: { text, cached: false },
  })
}
