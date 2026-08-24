'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldOff, Users } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  target_score: number
  is_admin: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    setUsers(json.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function toggleAdmin(user: UserRow) {
    const msg = user.is_admin
      ? `Hapus hak admin dari ${user.name}?`
      : `Jadikan ${user.name} sebagai admin?`
    if (!confirm(msg)) return

    setTogglingId(user.id)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, is_admin: !user.is_admin }),
    })
    setTogglingId(null)
    fetchUsers()
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
          <Users size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">{users.length} user terdaftar</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Memuat data user...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-24">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-24">Bergabung</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-20">Admin</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{u.target_score || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          <ShieldCheck size={11} /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">User</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={togglingId === u.id}
                        title={u.is_admin ? 'Hapus admin' : 'Jadikan admin'}
                        className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
