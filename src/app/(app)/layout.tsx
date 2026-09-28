import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, is_admin, onboarded_at')
    .eq('id', user.id)
    .single()

  // Belum pernah isi target skor & tanggal tes — antar ke onboarding dulu.
  if (profile && !profile.onboarded_at) redirect('/onboarding')

  const userName = profile?.name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email || ''
  const isAdmin = profile?.is_admin ?? false

  return (
    <AppShell userName={userName} userEmail={userEmail} isAdmin={isAdmin}>
      {children}
    </AppShell>
  )
}
