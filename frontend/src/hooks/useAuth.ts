'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? session.user.email ?? 'Usuário',
          role: 'SUPER_ADMIN' as const,
          avatar: null,
          phone: null,
          isActive: true,
          twoFactorEnabled: false,
          lastLogin: new Date().toISOString(),
          createdAt: session.user.created_at,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        storeLogout();
      }
    });
    return () => subscription.unsubscribe();
  }, [setUser, storeLogout]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        toast.error('Banco de dados não configurado');
        return { requiresTwoFactor: false };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.name ?? data.user.email ?? 'Usuário',
          role: 'SUPER_ADMIN' as const,
          avatar: null,
          phone: null,
          isActive: true,
          twoFactorEnabled: false,
          lastLogin: new Date().toISOString(),
          createdAt: data.user.created_at,
          updatedAt: new Date().toISOString(),
        });
        toast.success('Bem-vindo!');
        router.push('/dashboard');
      }

      return { requiresTwoFactor: false };
    },
    [router, setUser],
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    storeLogout();
    router.push('/login');
  }, [router, storeLogout]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
