import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import OnboardingFlow from './OnboardingFlow'

export const metadata: Metadata = { title: 'Selamat Datang — Belajar TPA' }

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { edit?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, target_score, test_date, onboarded_at')
    .eq('id', user.id)
    .single()

  // Sudah selesai onboarding — jangan ditanya lagi, kecuali memang
  // sengaja membuka lagi lewat tombol "Atur tanggal tes" di dashboard.
  const isEditing = searchParams.edit === '1'
  if (profile?.onboarded_at && !isEditing) redirect('/dashboard')

  return (
    <OnboardingFlow
      name={profile?.name || user.email?.split('@')[0] || 'Kamu'}
      initialTarget={profile?.target_score ?? 475}
      initialTestDate={profile?.test_date ?? ''}
      isEditing={isEditing}
    />
  )
}
