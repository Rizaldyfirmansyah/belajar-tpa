'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle, Upload, X, ImageIcon, Camera } from 'lucide-react'
import { SUBTESTS, TOPICS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { Subtest } from '@/types'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

async function uploadToStorage(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('question-images')
    .upload(filename, file, { cacheControl: '3600', upsert: false })
  if (error) throw new Error('Gagal upload: ' + error.message)
  const { data } = supabase.storage.from('question-images').getPublicUrl(filename)
  return data.publicUrl
}

function ImageUploadSlot({
  label,
  previewUrl,
  onSelect,
  onRemove,
}: {
  label: string
  previewUrl: string | null
  onSelect: (file: File) => void
  onRemove: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
  }

  if (previewUrl) {
    return (
      <div className="relative inline-flex items-start">
        <img src={previewUrl} alt={label} className="h-16 rounded-lg border border-gray-200 object-contain" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
        >
          <X size={10} />
        </button>
        <input ref={ref} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        title={`Upload gambar ${label}`}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
      >
        <Camera size={14} />
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </>
  )
}

export default function AddQuestionForm() {
  const router = useRouter()
  const questionImageRef = useRef<HTMLInputElement>(null)
  const explanationImageRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0)

  const [subtest, setSubtest] = useState<Subtest>('verbal')
  const [topic, setTopic] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '', E: '' })
  const [answer, setAnswer] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  // Image state
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null)
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null)
  const [optionImageFiles, setOptionImageFiles] = useState<Partial<Record<string, File>>>({})
  const [optionImagePreviews, setOptionImagePreviews] = useState<Partial<Record<string, string>>>({})
  const [explanationImageFile, setExplanationImageFile] = useState<File | null>(null)
  const [explanationImagePreview, setExplanationImagePreview] = useState<string | null>(null)

  const availableTopics = TOPICS.filter(t => t.subtest === subtest)

  function handleSubtest(s: Subtest) {
    setSubtest(s)
    setTopic('')
  }

  function handleOption(key: string, val: string) {
    setOptions(prev => ({ ...prev, [key]: val }))
  }

  function handleQuestionImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setQuestionImageFile(file)
    setQuestionImagePreview(URL.createObjectURL(file))
    setError('')
  }

  function handleOptionImage(key: string, file: File) {
    setOptionImageFiles(prev => ({ ...prev, [key]: file }))
    setOptionImagePreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }))
  }

  function removeOptionImage(key: string) {
    setOptionImageFiles(prev => { const n = { ...prev }; delete n[key]; return n })
    setOptionImagePreviews(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  function handleExplanationImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExplanationImageFile(file)
    setExplanationImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!topic) { setError('Pilih topik terlebih dahulu.'); return }
    if (!question.trim() && !questionImageFile) { setError('Teks soal atau gambar soal harus diisi.'); return }
    const allOptionsEmpty = OPTION_LABELS.every(k => !options[k].trim() && !optionImageFiles[k])
    if (allOptionsEmpty) { setError('Minimal satu pilihan jawaban harus diisi.'); return }
    const someOptionsEmpty = OPTION_LABELS.some(k => !options[k].trim() && !optionImageFiles[k])
    if (someOptionsEmpty) { setError('Semua pilihan jawaban (A–E) harus diisi (teks atau gambar).'); return }
    if (!explanation.trim() && !explanationImageFile) { setError('Pembahasan (teks atau gambar) harus diisi.'); return }

    setSaving(true)

    // Upload all images in parallel
    const uploads: Promise<void>[] = []
    let questionImageUrl: string | null = null
    const optionImageUrls: Partial<Record<string, string>> = {}
    let explanationImageUrl: string | null = null

    setUploadingCount(
      (questionImageFile ? 1 : 0) +
      Object.keys(optionImageFiles).length +
      (explanationImageFile ? 1 : 0)
    )

    try {
      if (questionImageFile) {
        uploads.push(uploadToStorage(questionImageFile).then(url => { questionImageUrl = url }))
      }
      for (const [key, file] of Object.entries(optionImageFiles)) {
        if (!file) continue
        uploads.push(uploadToStorage(file).then(url => { optionImageUrls[key] = url }))
      }
      if (explanationImageFile) {
        uploads.push(uploadToStorage(explanationImageFile).then(url => { explanationImageUrl = url }))
      }
      await Promise.all(uploads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload gambar')
      setSaving(false)
      setUploadingCount(0)
      return
    }

    setUploadingCount(0)

    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subtest,
        topic,
        question,
        options,
        answer,
        explanation,
        difficulty,
        image_url: questionImageUrl,
        options_images: Object.keys(optionImageUrls).length > 0 ? optionImageUrls : null,
        explanation_image_url: explanationImageUrl,
      }),
    })
    const json = await res.json()
    setSaving(false)

    if (json.error) {
      setError(json.error)
    } else {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setQuestion('')
        setOptions({ A: '', B: '', C: '', D: '', E: '' })
        setAnswer('A')
        setExplanation('')
        setDifficulty('medium')
        setQuestionImageFile(null)
        setQuestionImagePreview(null)
        setOptionImageFiles({})
        setOptionImagePreviews({})
        setExplanationImageFile(null)
        setExplanationImagePreview(null)
        if (questionImageRef.current) questionImageRef.current.value = ''
        if (explanationImageRef.current) explanationImageRef.current.value = ''
      }, 1500)
    }
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push('/admin/questions')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ChevronLeft size={15} />
        Kembali ke daftar soal
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Tambah Soal Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Kategori */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Kategori</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Subtest</label>
            <div className="flex gap-2 flex-wrap">
              {SUBTESTS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSubtest(s.id as Subtest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    subtest === s.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s.id === 'verbal' ? 'Verbal' : s.id === 'numerik' ? 'Numerik' : 'Penalaran'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Topik</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">-- Pilih topik --</option>
              {availableTopics.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Soal */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Soal</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Teks Soal</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={3}
              placeholder="Tuliskan soal di sini... (opsional jika ada gambar)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Gambar soal */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Gambar Soal
              {topic === 'penalaran_gambar' && (
                <span className="ml-2 text-violet-600 font-medium">• Disarankan</span>
              )}
            </label>
            {questionImagePreview ? (
              <div className="relative inline-block">
                <img src={questionImagePreview} alt="Preview soal" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                <button
                  type="button"
                  onClick={() => { setQuestionImageFile(null); setQuestionImagePreview(null); if (questionImageRef.current) questionImageRef.current.value = '' }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => questionImageRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors gap-1.5"
              >
                <ImageIcon size={18} className="text-gray-400" />
                <span className="text-xs text-gray-400">Klik untuk upload (JPG, PNG, max 5MB)</span>
              </button>
            )}
            <input ref={questionImageRef} type="file" accept="image/*" onChange={handleQuestionImageSelect} className="hidden" />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Pilihan Jawaban</label>
            <div className="space-y-2">
              {OPTION_LABELS.map(key => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      answer === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {key}
                    </span>
                    <input
                      type="text"
                      value={options[key]}
                      onChange={e => handleOption(key, e.target.value)}
                      placeholder={`Pilihan ${key} (teks)`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <ImageUploadSlot
                      label={key}
                      previewUrl={optionImagePreviews[key] || null}
                      onSelect={file => handleOptionImage(key, file)}
                      onRemove={() => removeOptionImage(key)}
                    />
                    <button
                      type="button"
                      onClick={() => setAnswer(key)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-colors flex-shrink-0 ${
                        answer === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {answer === key ? 'Jawaban' : 'Pilih'}
                    </button>
                  </div>
                  {/* Show option image preview inline */}
                  {optionImagePreviews[key] && (
                    <div className="ml-9">
                      <img src={optionImagePreviews[key]} alt={`Gambar pilihan ${key}`} className="max-h-24 rounded-lg border border-gray-200 object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pembahasan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Pembahasan</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Teks Pembahasan</label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={3}
              placeholder="Jelaskan mengapa jawaban tersebut benar... (opsional jika ada gambar)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Gambar pembahasan */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Gambar Pembahasan</label>
            {explanationImagePreview ? (
              <div className="relative inline-block">
                <img src={explanationImagePreview} alt="Preview pembahasan" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                <button
                  type="button"
                  onClick={() => { setExplanationImageFile(null); setExplanationImagePreview(null); if (explanationImageRef.current) explanationImageRef.current.value = '' }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => explanationImageRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors gap-1.5"
              >
                <ImageIcon size={18} className="text-gray-400" />
                <span className="text-xs text-gray-400">Klik untuk upload gambar pembahasan</span>
              </button>
            )}
            <input ref={explanationImageRef} type="file" accept="image/*" onChange={handleExplanationImageSelect} className="hidden" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Tingkat Kesulitan</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-green-600 text-white border-green-600'
                        : d === 'hard' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {d === 'easy' ? 'Mudah' : d === 'medium' ? 'Sedang' : 'Sulit'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || saved}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70'
          }`}
        >
          {saved ? (
            <><CheckCircle size={16} /> Soal berhasil disimpan!</>
          ) : saving ? (
            uploadingCount > 0 ? (
              <><Upload size={16} className="animate-bounce" /> Mengupload {uploadingCount} gambar...</>
            ) : (
              'Menyimpan...'
            )
          ) : (
            'Simpan Soal'
          )}
        </button>
      </form>
    </div>
  )
}
