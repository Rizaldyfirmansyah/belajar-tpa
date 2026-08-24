import { createClient } from '@/lib/supabase/server'
import { TOPICS, SUBTESTS, getTopicsBySubtest } from '@/lib/constants'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import ProgressBar from '@/components/ui/ProgressBar'

async function getPageData(userId: string) {
  const supabase = createClient()

  const [drillRes, tryoutRes, countRes] = await Promise.all([
    supabase.from('drill_answers').select('topic, question_id').eq('user_id', userId),
    supabase.from('tryout_answers').select('topic, question_id').eq('user_id', userId),
    supabase.from('questions').select('topic'),
  ])

  const allAnswers = [...(drillRes.data || []), ...(tryoutRes.data || [])]
  const uniqueByTopic: Record<string, Set<string>> = {}
  for (const a of allAnswers) {
    if (!uniqueByTopic[a.topic]) uniqueByTopic[a.topic] = new Set()
    uniqueByTopic[a.topic].add(a.question_id)
  }

  const questionCount: Record<string, number> = {}
  for (const row of (countRes.data || [])) {
    questionCount[row.topic] = (questionCount[row.topic] || 0) + 1
  }

  return { progress: uniqueByTopic, questionCount }
}

export default async function BelajarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { progress, questionCount } = await getPageData(user!.id)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Belajar</h1>
        <p className="text-gray-500 text-sm mt-1">Pilih topik untuk mulai latihan soal</p>
      </div>

      {SUBTESTS.map(subtest => {
        const topics = getTopicsBySubtest(subtest.id)
        const colorMap = { verbal: 'blue', numerik: 'emerald', penalaran: 'violet' } as const
        const color = colorMap[subtest.id]

        return (
          <div key={subtest.id}>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={subtest.id}>{subtest.label}</Badge>
              <span className="text-xs text-gray-400">{topics.length} topik</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {topics.map(topic => {
                const done = progress[topic.id]?.size ?? 0
                const bank = questionCount[topic.id] ?? 0
                const pct = bank > 0 ? Math.round((done / bank) * 100) : 0

                return (
                  <Link key={topic.id} href={`/belajar/${topic.id}`}>
                    <Card className="h-full hover:shadow-md hover:border-blue-200 transition-all duration-150 cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <BookOpen size={16} className="text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <Badge variant={subtest.id}>
                          {topic.totalPerTryout} soal/TO
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{topic.label}</h3>
                      <p className="text-xs text-gray-400 mb-3">Bank: {bank} soal</p>

                      <ProgressBar value={done} max={Math.max(bank, 1)} color={color} />
                      <p className="text-xs text-gray-500 mt-1.5">
                        {done} dikerjakan ({pct}%)
                      </p>

                      <div className="flex items-center justify-end mt-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium">Mulai</span>
                        <ChevronRight size={14} />
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
