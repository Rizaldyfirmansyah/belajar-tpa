'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, BarChart2, ClipboardList, Bookmark, LogOut, GraduationCap, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import FeedbackButton from '@/components/layout/FeedbackButton'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/belajar', label: 'Belajar', icon: BookOpen },
  { href: '/tryout', label: 'Try Out', icon: ClipboardList },
  { href: '/bookmark', label: 'Bookmark', icon: Bookmark },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function Sidebar({ isOpen, onClose, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleNavClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full flex flex-col z-30 bg-blue-700 overflow-hidden',
      'transition-all duration-200 ease-in-out',
      isOpen
        ? 'w-[240px] translate-x-0'
        : 'w-[240px] -translate-x-full lg:w-[64px] lg:translate-x-0'
    )}>
      {/* Logo */}
      <div className="border-b border-blue-600 flex-shrink-0">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className={cn(
            'flex items-center h-[60px] px-4 gap-2.5',
            !isOpen && 'lg:justify-center lg:px-0 lg:gap-0'
          )}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className={cn(
            'overflow-hidden transition-all duration-200 whitespace-nowrap',
            !isOpen ? 'lg:w-0 lg:opacity-0 lg:ml-0 ml-0' : 'w-auto opacity-100'
          )}>
            <div className="text-sm font-heading font-bold text-white leading-tight">Belajar TPA</div>
            <div className="text-xs text-blue-200 leading-tight">Latihan TPA</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              title={!isOpen ? label : undefined}
              className={cn(
                'flex items-center rounded-lg py-2.5 transition-colors duration-150',
                isOpen ? 'px-3 gap-3' : 'px-3 gap-3 lg:justify-center lg:px-0',
                isActive
                  ? 'bg-white text-blue-700'
                  : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              )}
            >
              <Icon
                size={18}
                className={cn('flex-shrink-0', isActive ? 'text-blue-600' : 'text-blue-200')}
              />
              <span className={cn(
                'text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden',
                !isOpen && 'lg:w-0 lg:opacity-0'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Saran */}
      <FeedbackButton isOpen={isOpen} />

      {/* Admin */}
      {isAdmin && (
        <div className="border-t border-blue-600 p-2 flex-shrink-0">
          <Link
            href="/admin/questions"
            onClick={handleNavClick}
            title={!isOpen ? 'Admin' : undefined}
            className={cn(
              'flex items-center rounded-lg py-2.5 transition-colors duration-150',
              isOpen ? 'px-3 gap-3' : 'px-3 gap-3 lg:justify-center lg:px-0',
              pathname.startsWith('/admin')
                ? 'bg-white text-blue-700'
                : 'text-blue-100 hover:bg-blue-600 hover:text-white'
            )}
          >
            <ShieldCheck
              size={18}
              className={cn('flex-shrink-0', pathname.startsWith('/admin') ? 'text-blue-600' : 'text-blue-200')}
            />
            <span className={cn(
              'text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden',
              !isOpen && 'lg:w-0 lg:opacity-0'
            )}>
              Admin
            </span>
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-blue-600 p-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          title={!isOpen ? 'Keluar' : undefined}
          className={cn(
            'w-full flex items-center rounded-lg py-2.5 text-blue-100 hover:bg-blue-600 hover:text-white transition-colors',
            isOpen ? 'px-3 gap-3' : 'px-3 gap-3 lg:justify-center lg:px-0'
          )}
        >
          <LogOut size={18} className="text-blue-200 flex-shrink-0" />
          <span className={cn(
            'text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden',
            !isOpen && 'lg:w-0 lg:opacity-0'
          )}>
            Keluar
          </span>
        </button>
      </div>
    </aside>
  )
}
