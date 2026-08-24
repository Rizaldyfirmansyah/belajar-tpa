'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBTESTS, TOPICS } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import type { Subtest } from '@/types'

interface Question {
  id: string
  subtest: string
  topic: string
  question: string | null
  options: Record<string, string> | null
  options_images: Record<string, string> | null
  answer: string
  explanation: string | null
  explanation_image_url: string | null
  difficulty: string
  question_type: string
  image_url: string | null
  created_at: string
}

export default function QuestionManager() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [subtest, setSubtest] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const LIMIT = 20
  const totalPages = Math.ceil(total / LIMIT)

  const topicsBySubtest = subtest
    ? TOPICS.filter(t => t.subtest === subtest)
    : TOPICS

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      ...(subtest && { subtest }),
      ...(topic && { topic }),
      ...(debouncedSearch && { search: debouncedSearch }),
    })
    const res = await fetch(`/api/admin/questions?${params}`)
    const json = await res.json()
    if (json.data) {
      setQuestions(json.data.questions || [])
      setTotal(json.data.total || 0)
      setCounts(json.data.counts || {})
    }
    setLoading(false)
  }, [page, subtest, topic, debouncedSearch])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  function handleSubtest(s: string) {
    setSubtest(s)
    setTopic('')
    setPage(1)
  }

  function handleTopic(t: string) {
    setTopic(t)
    setPage(1)
  }

  async function handleDelete(id: string, questionText: string | null) {
    const preview = (questionText || '[Soal bergambar]').slice(0, 60)
    if (!confirm(`Hapus soal ini?\n\n"${preview}"\n\nData jawaban terkait juga akan terhapus.`)) return

    setDeletingId(id)
    const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeletingId(null)

    if (json.data?.deleted) {
      if (expandedId === id) setExpandedId(null)
      fetchQuestions()
    } else {
      alert('Gagal menghapus: ' + (json.error || 'Unknown error'))
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const topicLabel = (id: string) => TOPICS.find(t => t.id === id)?.label || id

  const difficultyBadge = (d: string) => {
    if (d === 'easy') return <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full">Mudah</span>
    if (d === 'hard') return <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-700 rounded-full">Sulit</span>
    return <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full">Sedang</span>
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Soal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total: {Object.values(counts).reduce((a, b) => a + b, 0)} soal</p>
        </div>
        <button
          onClick={() => router.push('/admin/questions/tambah')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          Tambah Soal
        </button>
      </div>

      {/* Topic count tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {TOPICS.map(t => (
          <button
            key={t.id}
            onClick={() => { handleSubtest(t.subtest); handleTopic(t.id) }}
            className={cn(
              'p-2.5 rounded-lg border text-left transition-all',
              topic === t.id
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <p className="text-xs text-gray-500 truncate">{t.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{counts[t.id] || 0}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => handleSubtest('')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              !subtest ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Semua
          </button>
          {SUBTESTS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSubtest(s.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                subtest === s.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {s.id === 'verbal' ? 'Verbal' : s.id === 'numerik' ? 'Numerik' : 'Penalaran'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={topic}
            onChange={e => handleTopic(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">Semua Topik</option>
            {topicsBySubtest.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari teks soal..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="text-sm text-gray-700 outline-none flex-1 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Memuat soal...</div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Tidak ada soal ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Soal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-36">Topik</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-16">Jwb</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-24">Level</th>
                  <th className="w-20 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <>
                    <tr
                      key={q.id}
                      onClick={() => toggleExpand(q.id)}
                      className={cn(
                        'border-b border-gray-100 cursor-pointer transition-colors',
                        expandedId === q.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Badge variant={q.subtest as Subtest} className="flex-shrink-0 mt-0.5">
                            {q.subtest}
                          </Badge>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {q.image_url && <Image size={12} className="text-gray-400 flex-shrink-0" />}
                            <span className="text-gray-700 line-clamp-2 text-xs leading-relaxed">
                              {q.question || '[Soal bergambar]'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{topicLabel(q.topic)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex w-6 h-6 items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
                          {q.answer}
                        </span>
                      </td>
                      <td className="px-4 py-3">{difficultyBadge(q.difficulty)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(q.id, q.question) }}
                            disabled={deletingId === q.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="text-gray-300">
                            {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedId === q.id && (
                      <tr key={`${q.id}-detail`} className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            {/* Full question + image */}
                            {(q.question || q.image_url) && (
                              <div className="space-y-2">
                                {q.question && (
                                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{q.question}</p>
                                )}
                                {q.image_url && (
                                  <img
                                    src={q.image_url}
                                    alt="Gambar soal"
                                    className="max-h-48 rounded-lg border border-gray-200 object-contain"
                                  />
                                )}
                              </div>
                            )}

                            {/* Options A–E */}
                            {q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {(['A', 'B', 'C', 'D', 'E'] as const).map(key => (
                                  <div
                                    key={key}
                                    className={cn(
                                      'flex items-start gap-2 px-3 py-2 rounded-lg text-xs',
                                      q.answer === key
                                        ? 'bg-green-100 text-green-800 font-semibold'
                                        : 'bg-white text-gray-600'
                                    )}
                                  >
                                    <span className={cn(
                                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                                      q.answer === key ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                    )}>
                                      {key}
                                    </span>
                                    <div className="space-y-1 min-w-0">
                                      {q.options?.[key] && (
                                        <span className="leading-relaxed block">{q.options[key]}</span>
                                      )}
                                      {q.options_images?.[key] && (
                                        <img
                                          src={q.options_images[key]}
                                          alt={`Pilihan ${key}`}
                                          className="max-h-20 rounded border border-gray-200 object-contain"
                                        />
                                      )}
                                      {!q.options?.[key] && !q.options_images?.[key] && (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Pembahasan */}
                            {(q.explanation || q.explanation_image_url) && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 space-y-2">
                                <p className="text-xs font-semibold text-amber-700">Pembahasan</p>
                                {q.explanation && (
                                  <p className="text-xs text-amber-800 leading-relaxed">{q.explanation}</p>
                                )}
                                {q.explanation_image_url && (
                                  <img
                                    src={q.explanation_image_url}
                                    alt="Gambar pembahasan"
                                    className="max-h-40 rounded-lg border border-amber-200 object-contain"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} soal
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-600 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
