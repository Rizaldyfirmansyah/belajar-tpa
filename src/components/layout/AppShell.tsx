'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/layout/Sidebar'
import AppHeader from '@/components/layout/AppHeader'

interface AppShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
  isAdmin?: boolean
}

export default function AppShell({ children, userName, userEmail, isAdmin = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />

      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-200 ease-in-out',
        sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[64px]'
      )}>
        <AppHeader
          userName={userName}
          onToggle={() => setSidebarOpen(v => !v)}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
