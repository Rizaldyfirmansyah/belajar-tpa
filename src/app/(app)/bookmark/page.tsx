'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck, Filter } from 'lucide-react'
import type { Bookmark as BookmarkType, Topic, Subtest } from '@/types'
import { TOPICS, SUBTESTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import OptionButton from '@/components/question/OptionButton'
import ExplanationBox from '@/components/question/ExplanationBox'
import VisualQuestion from '@/components/visual/VisualQuestion'

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubtest, setFilterSubtest] = useState<Subtest | 'all'>('all')
  const [filterTopic, setFilterTopic] = useState<Topic | 'all'>('all')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(j => setBookmarks(j.data || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(bookmarkId: string, questionId: string) {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    await fetch(`/api/bookmarks?questionId=${questionId}`, { method: 'DELETE' })
  }

  const filteredTopics = filterSubtest === 'all'
    ? TOPICS
    : TOPICS.filter(t => t.subtest === filterSubtest)

  const filtered = bookmarks.filter(b => {
    if (!b.question) return false
    if (filterSubtest !== 'all' && b.question.subtest !== filterSubtest) return false
    if (filterTopic !== 'all' && b.question.topic !== filterTopic) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Bookmark</h1>
        <p className="text-gray-500 text-sm mt-1">{bookmarks.length} soal tersimpan</p>
      </div>

      {/* Filters */}
      {bookmarks.length > 0 && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Filter Subtest</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterSubtest('all'); setFilterTopic('all') }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterSubtest === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Semua
              </button>
              {SUBTESTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setFilterSubtest(s.id); setFilterTopic('all') }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    filterSubtest === s.id
                      ? s.id === 'verbal' ? 'bg-blue-600 text-white'
                        : s.id === 'numerik' ? 'bg-emerald-600 text-white'
                        : 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {filterSubtest !== 'all' && (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTopic('all')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    filterTopic === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Semua Topik
                </button>
                {filteredTopics.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTopic(t.id)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                      filterTopic === t.id ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Bookmark list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bookmark size={28} />}
            title="Belum ada bookmark"
            description={bookmarks.length > 0 ? 'Tidak ada soal dengan filter ini.' : 'Bookmark soal saat belajar atau try out untuk review nanti.'}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const q = b.question!
            const isExpanded = expanded.has(b.id)
            const selectedAns = answers[q.id]

            return (
              <Card key={b.id} padding={false}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={q.subtest as 'verbal' | 'numerik' | 'penalaran'}>
                          {TOPICS.find(t => t.id === q.topic)?.label}
                        </Badge>
                      </div>
                      {q.question_type === 'text' ? (
                        <p className="text-sm text-gray-700 line-clamp-2">{q.question}</p>
                      ) : (
                        <p className="text-sm text-gray-700">{q.visual_data?.question}</p>
                      )}

                      <button
                        onClick={() => setExpanded(prev => {
                          const s = new Set(prev)
                          s.has(b.id) ? s.delete(b.id) : s.add(b.id)
                          return s
                        })}
                        className="text-xs text-blue-600 hover:underline mt-1.5"
                      >
                        {isExpanded ? 'Sembunyikan' : 'Kerjakan soal'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(b.id, q.id)}
                      className="text-amber-500 hover:text-gray-400 transition-colors flex-shrink-0"
                    >
                      <BookmarkCheck size={18} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {q.question_type === 'visual' && q.visual_data ? (
                        <VisualQuestion
                          visualData={q.visual_data}
                          selectedAnswer={selectedAns}
                          correctAnswer={selectedAns ? q.answer : undefined}
                          showAnswer={!!selectedAns}
                          onSelect={opt => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          disabled={!!selectedAns}
                        />
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-800 leading-relaxed mb-3">{q.question}</p>
                          {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                            if (!q.options?.[opt]) return null
                            return (
                              <OptionButton
                                key={opt}
                                label={opt}
                                text={q.options[opt]}
                                selected={selectedAns === opt && !selectedAns}
                                correct={!!selectedAns && opt === q.answer}
                                wrong={!!selectedAns && opt === selectedAns && opt !== q.answer}
                                disabled={!!selectedAns}
                                onClick={() => !selectedAns && setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              />
                            )
                          })}
                        </div>
                      )}

                      {selectedAns && (q.explanation || q.visual_data?.explanation) && (
                        <ExplanationBox
                          explanation={(q.explanation || q.visual_data?.explanation) ?? ''}
                          isCorrect={selectedAns === q.answer}
                          correctAnswer={q.answer || ''}
                        />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
