'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/lib/api';
import { toast } from 'sonner';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string, twoFactorCode?: string) => {
      const data = await authService.login(email, password, twoFactorCode);

      if ('requiresTwoFactor' in data && data.requiresTwoFactor) {
        return { requiresTwoFactor: true };
      }

      const { user, accessToken, refreshToken } = data as {
        user: typeof data.user;
        accessToken: string;
        refreshToken: string;
      };

      setTokens(accessToken, refreshToken);
      setUser(user);
      router.push('/');
      return { requiresTwoFactor: false };
    },
    [router, setUser],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [router, storeLogout]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
