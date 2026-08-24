'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError('Email atau password salah. Silakan coba lagi.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h1 className="text-xl font-heading font-bold text-gray-900 mb-1">Masuk</h1>
      <p className="text-sm text-gray-500 mb-6">Lanjutkan perjalanan belajar kamu</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Masukkan password"
          icon={<Lock size={16} />}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Masuk
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Belum punya akun?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}
