'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, BarChart2, BookOpen, ClipboardList, Bookmark, GraduationCap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/belajar', label: 'Belajar', icon: BookOpen },
  { href: '/tryout', label: 'Try Out', icon: ClipboardList },
  { href: '/bookmark', label: 'Bookmark', icon: Bookmark },
]

interface TopBarProps {
  userName: string
}

export default function TopBar({ userName }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="text-sm font-heading font-bold text-gray-900">Belajar TPA</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-700">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-gray-900/50" onClick={() => setOpen(false)} />
          <div className="lg:hidden fixed top-14 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
            <nav className="p-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    {label}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
              >
                <LogOut size={18} className="text-gray-400" />
                Keluar
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
