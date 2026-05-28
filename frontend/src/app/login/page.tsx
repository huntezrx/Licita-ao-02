'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data.email, data.password, data.twoFactorCode);
      if (result.requiresTwoFactor) {
        setRequires2FA(true);
        toast.info('Digite o código 2FA do seu autenticador');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#08080a' }}>
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 100%)',
      }} />

      <div className="w-full max-w-[360px] relative">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
            style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#3b82f6" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#3b82f6" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#3b82f6" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#3b82f6" opacity="0.25"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.02em' }}>LicitaNex</h1>
          <p className="text-xs mt-1" style={{ color: '#44444f' }}>Gestão de Licitações Públicas</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6" style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="mb-6">
            <h2 className="text-base font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.01em' }}>
              Acesse sua conta
            </h2>
            <p className="text-xs mt-1" style={{ color: '#7f7f8c' }}>Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com.br"
                className="input-premium"
              />
              {errors.email && <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: '#7f7f8c' }}>Senha</label>
                <Link href="/forgot-password" className="text-[11px] transition-colors" style={{ color: '#3b82f6' }}>
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-premium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#44444f' }}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            {/* 2FA */}
            {requires2FA && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Código 2FA</label>
                <input
                  {...register('twoFactorCode')}
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="input-premium text-center text-lg tracking-[0.3em]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              style={{ padding: '9px 14px', fontSize: '13px' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Entrando...</>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <p className="text-[11px] font-medium mb-1" style={{ color: '#60a5fa' }}>Modo demonstração</p>
          <p className="text-[11px]" style={{ color: '#7f7f8c' }}>
            <span style={{ color: '#b0b0be' }}>admin@licitanex.com.br</span> · <span style={{ color: '#b0b0be' }}>Demo@2024</span>
          </p>
        </div>
      </div>
    </div>
  );
}
