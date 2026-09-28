'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types'

const KINDS = [
  { id: 'saran', label: 'Saran' },
  { id: 'bug', label: 'Ada Error' },
  { id: 'lainnya', label: 'Lainnya' },
] as const

type Kind = (typeof KINDS)[number]['id']

export default function FeedbackButton({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('saran')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Modal harus di-portal ke body: <aside> sidebar punya transform, yang
  // bikin dia jadi containing block untuk elemen fixed, plus overflow-hidden.
  // Tanpa portal, modalnya keklip di dalam sidebar selebar 240px.
  useEffect(() => setMounted(true), [])

  function close() {
    setModalOpen(false)
    // Reset setelah animasi tutup, biar isinya tidak berkedip saat ditutup.
    setTimeout(() => {
      setMessage('')
      setKind('saran')
      setSent(false)
      setError('')
    }, 200)
  }

  async function submit() {
    if (message.trim().length < 5) {
      setError('Tulis minimal 5 karakter ya.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, message: message.trim(), page: pathname }),
      })
      const json: ApiResponse = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal mengirim')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="px-2 pb-2 flex-shrink-0">
        <button
          onClick={() => setModalOpen(true)}
          title={!isOpen ? 'Kirim saran' : undefined}
          className={cn(
            'w-full rounded-lg border border-dashed border-blue-400/50 bg-blue-600/30',
            'text-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-300',
            'transition-colors duration-150',
            isOpen ? 'p-3 text-left' : 'p-3 text-left lg:p-2.5 lg:flex lg:justify-center'
          )}
        >
          <span className={cn('flex items-center gap-2.5', !isOpen && 'lg:gap-0')}>
            <MessageSquarePlus size={18} className="flex-shrink-0 text-blue-200" />
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200',
                !isOpen && 'lg:w-0 lg:opacity-0'
              )}
            >
              Kirim Saran
            </span>
          </span>
          <span
            className={cn(
              'block text-xs text-blue-200/80 mt-1 leading-snug whitespace-normal',
              !isOpen && 'lg:hidden'
            )}
          >
            Masih tahap pengembangan — masukanmu membantu.
          </span>
        </button>
      </div>

      {mounted &&
        createPortal(
          <Modal open={modalOpen} onClose={close} title="Kirim Saran">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                <p className="text-base font-semibold text-gray-900 mt-3">Terima kasih!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Masukanmu sudah kami terima dan akan kami baca.
                </p>
                <Button variant="secondary" onClick={close} className="mt-5">
                  Tutup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Jenis masukan</label>
                  <div className="flex gap-2 mt-2">
                    {KINDS.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setKind(k.id)}
                        className={cn(
                          'px-3 h-8 rounded-full text-sm font-medium border transition-colors',
                          kind === k.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-message" className="text-sm font-medium text-gray-700">
                    Pesan
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    autoFocus
                    placeholder="Fitur apa yang kurang, soal yang salah, atau bagian yang membingungkan?"
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{message.length}/2000</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={close} disabled={submitting}>
                    Batal
                  </Button>
                  <Button onClick={submit} loading={submitting}>
                    Kirim
                  </Button>
                </div>
              </div>
            )}
          </Modal>,
          document.body
        )}
    </>
  )
}
