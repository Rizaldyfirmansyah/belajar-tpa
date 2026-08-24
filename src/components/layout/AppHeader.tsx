'use client'

import Link from 'next/link'
import { Menu, GraduationCap } from 'lucide-react'

interface AppHeaderProps {
  userName: string
  onToggle: () => void
}

export default function AppHeader({ userName, onToggle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 flex-shrink-0">
      <button
        onClick={onToggle}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Logo — mobile only */}
      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
          <GraduationCap size={14} className="text-white" />
        </div>
        <span className="text-sm font-heading font-bold text-gray-900">Belajar TPA</span>
      </Link>

      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-2.5">
        <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-blue-700">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
