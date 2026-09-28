'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Target, CalendarDays, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types'

const PRESETS = [
  { score: 475, label: 'Batas lulus', note: 'Standar minimum UPDA' },
  { score: 550, label: 'Aman',        note: 'Di atas rata-rata peserta' },
  { score: 600, label: 'Kompetitif',  note: 'Untuk prodi & beasiswa ketat' },
] as const

const TOTAL_STEPS = 3

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function OnboardingFlow({
  name,
  initialTarget,
  initialTestDate = '',
  isEditing = false,
}: {
  name: string
  initialTarget: number
  initialTestDate?: string
  isEditing?: boolean
}) {
  const router = useRouter()
  // Saat mengubah dari dashboard, langsung ke langkah pengaturan —
  // sapaan perkenalan hanya relevan saat pertama kali.
  const [step, setStep] = useState(isEditing ? 1 : 0)
  const [target, setTarget] = useState(initialTarget)
  const [testDate, setTestDate] = useState(initialTestDate)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function finish(skipDate = false) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetScore: target,
          testDate: skipDate || !testDate ? null : testDate,
        }),
      })
      const json: ApiResponse = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={19} className="text-white" />
          </div>
          <span className="text-lg font-heading font-bold text-ink">Belajar TPA</span>
        </div>

        <div className="bg-surface border border-line rounded-2xl shadow-sm p-7 sm:p-9">
          {/* Progress */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step ? 'bg-blue-600' : 'bg-line'
                )}
              />
            ))}
          </div>

          {/* Step 1 — sapaan */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-heading font-bold text-ink">Halo, {name}.</h1>
              <p className="prose-reading text-body mt-3">
                Sebelum mulai, kami butuh dua hal supaya progresmu bisa diukur dengan benar:
                skor yang kamu incar, dan kapan tesnya. Isinya cepat, dan bisa diubah kapan saja.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: Target, text: 'Target skor jadi acuan grafik dan analisis AI' },
                  { icon: CalendarDays, text: 'Tanggal tes dipakai untuk mengatur ritme belajar' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <p className="text-sm text-body leading-relaxed pt-1.5">{text}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} fullWidth size="lg" className="mt-8">
                Mulai <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* Step 2 — target skor */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-heading font-bold text-ink">Target skormu berapa?</h1>
              <p className="text-body mt-2 text-sm leading-relaxed">
                Skor TPA berkisar 200–800. Pilih yang realistis — target bisa dinaikkan nanti.
              </p>

              <div className="mt-6 space-y-2.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.score}
                    type="button"
                    onClick={() => setTarget(p.score)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors',
                      target === p.score
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-line bg-surface hover:bg-canvas'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xl font-heading font-bold w-14 flex-shrink-0',
                        target === p.score ? 'text-blue-700' : 'text-ink'
                      )}
                    >
                      {p.score}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink">{p.label}</span>
                      <span className="block text-xs text-muted mt-0.5">{p.note}</span>
                    </span>
                    {target === p.score && (
                      <Check size={18} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <label className="block mt-5">
                <span className="text-sm font-medium text-body">Atau tentukan sendiri</span>
                <input
                  type="number"
                  min={200}
                  max={800}
                  step={5}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="input-base mt-2"
                />
              </label>

              {(target < 200 || target > 800) && (
                <p className="text-sm text-red-600 mt-2">Skor harus antara 200 dan 800.</p>
              )}

              <div className="flex gap-2 mt-8">
                {!isEditing && (
                  <Button variant="secondary" onClick={() => setStep(0)} size="lg">
                    <ArrowLeft size={16} />
                  </Button>
                )}
                <Button
                  onClick={() => setStep(2)}
                  disabled={target < 200 || target > 800}
                  fullWidth
                  size="lg"
                >
                  Lanjut <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — tanggal tes */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-heading font-bold text-ink">Kapan tesmu?</h1>
              <p className="text-body mt-2 text-sm leading-relaxed">
                Dipakai untuk menghitung sisa waktu dan menyesuaikan ritme latihan.
              </p>

              <label className="block mt-6">
                <span className="text-sm font-medium text-body">Tanggal tes</span>
                <input
                  type="date"
                  value={testDate}
                  min={todayISO()}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="input-base mt-2"
                />
              </label>

              <p className="text-xs text-muted mt-3 leading-relaxed">
                Belum tahu tanggal pastinya? Lewati saja — bisa diisi belakangan lewat dashboard.
              </p>

              {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

              <div className="flex gap-2 mt-8">
                <Button variant="secondary" onClick={() => setStep(1)} size="lg" disabled={saving}>
                  <ArrowLeft size={16} />
                </Button>
                <Button onClick={() => finish(false)} loading={saving} fullWidth size="lg">
                  Selesai
                </Button>
              </div>

              <button
                type="button"
                onClick={() => finish(true)}
                disabled={saving}
                className="w-full text-center text-sm text-muted hover:text-ink mt-4 transition-colors disabled:opacity-50"
              >
                Lewati, saya belum tahu tanggalnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
