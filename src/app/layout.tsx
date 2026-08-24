import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Belajar TPA — Platform Latihan & Try Out TPA',
  description: 'Platform latihan TPA terlengkap. Drill soal, simulasi try out 250 soal, analisis AI, dan dashboard progress untuk persiapan TPA S2, LPDP, BUMN, dan lainnya.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
