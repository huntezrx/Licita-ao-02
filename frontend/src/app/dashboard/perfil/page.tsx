'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/formatters';
import { toast } from 'sonner';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Campo obrigatório'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PerfilPage() {
  const { user } = useAuthStore();
  const [changing2FA, setChanging2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Senha alterada com sucesso');
      reset();
    } catch {
      toast.error('Erro ao alterar senha. Verifique a senha atual.');
    }
  };

  const handleSetup2FA = async () => {
    try {
      const { qrCodeUrl } = await authService.setup2FA();
      setQrCode(qrCodeUrl);
    } catch {
      toast.error('Erro ao configurar 2FA');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await authService.enable2FA(twoFACode);
      toast.success('2FA ativado com sucesso!');
      setQrCode(null);
      setTwoFACode('');
    } catch {
      toast.error('Código inválido');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie suas informações e segurança</p>
      </div>

      {/* Profile Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Informações Pessoais</h3>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-xs text-blue-400 font-medium mt-1">
              {USER_ROLE_LABELS[user?.role || ''] || user?.role}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Último acesso</p>
            <p className="text-slate-300">{formatDateTime(user?.lastLogin) || 'Nunca'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Membro desde</p>
            <p className="text-slate-300">{formatDateTime(user?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Alterar Senha</h3>
        </div>
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block capitalize">
                {field === 'currentPassword' ? 'Senha Atual' : field === 'newPassword' ? 'Nova Senha' : 'Confirmar Nova Senha'}
              </label>
              <input
                {...register(field as keyof PasswordForm)}
                type="password"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              {errors[field as keyof PasswordForm] && (
                <p className="text-xs text-red-400 mt-1">{errors[field as keyof PasswordForm]?.message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Alterar Senha
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Autenticação em Dois Fatores</h3>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-300">
              Status: {user?.twoFactorEnabled ? (
                <span className="text-emerald-400 font-medium">Ativado</span>
              ) : (
                <span className="text-slate-400 font-medium">Desativado</span>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Adicione uma camada extra de segurança à sua conta
            </p>
          </div>
          {!user?.twoFactorEnabled && (
            <button
              onClick={handleSetup2FA}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Ativar 2FA
            </button>
          )}
        </div>

        {qrCode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-400">
              Escaneie o QR Code com seu autenticador (Google Authenticator, Authy, etc.)
            </p>
            <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40 mx-auto" />
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Código de verificação</label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                maxLength={6}
                placeholder="000000"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm text-center tracking-widest"
              />
            </div>
            <button
              onClick={handleEnable2FA}
              disabled={twoFACode.length !== 6}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Confirmar e Ativar
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
