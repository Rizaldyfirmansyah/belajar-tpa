import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Belajar TPA — Masuk',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 5L11 6.5V9.5L8 11L5 9.5V6.5L8 5Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-heading font-bold text-gray-900">Belajar TPA</span>
          </div>
          <p className="text-sm text-gray-500">Platform latihan TPA untuk S2, LPDP, BUMN & lainnya</p>
        </div>
        {children}
      </div>
    </div>
  )
}
