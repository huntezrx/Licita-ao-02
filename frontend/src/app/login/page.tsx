'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Credenciais inválidas';
      toast.error(msg === 'Invalid login credentials' ? 'Email ou senha incorretos' : msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f4f5f7' }}>
      <div className="w-full max-w-[360px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo-full.png" alt="Impacta Empreendimentos" width={200} height={80} style={{ objectFit: 'contain' }} priority />
          </div>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Sistema de Gestão de Licitações</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="mb-6">
            <h2 className="text-base font-semibold" style={{ color: '#111827', letterSpacing: '-0.01em' }}>
              Acesse sua conta
            </h2>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com.br"
                className="input-premium"
              />
              {errors.email && <p className="text-[11px] mt-1" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Senha</label>
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
                  style={{ color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] mt-1" style={{ color: '#dc2626' }}>{errors.password.message}</p>}
            </div>

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
      </div>
    </div>
  );
}
