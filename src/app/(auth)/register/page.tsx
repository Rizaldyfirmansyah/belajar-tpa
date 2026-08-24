'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Email sudah terdaftar. Silakan login.')
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h1 className="text-xl font-heading font-bold text-gray-900 mb-1">Daftar Akun</h1>
      <p className="text-sm text-gray-500 mb-6">Mulai persiapan UPDA ITB kamu</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Nama kamu"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 karakter"
            icon={<Lock size={16} />}
            rightAction={<EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <p className="mt-1 text-xs text-gray-400">Minimal 6 karakter</p>
        </div>
        <Input
          label="Konfirmasi Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Ulangi password"
          icon={<Lock size={16} />}
          rightAction={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Buat Akun
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
