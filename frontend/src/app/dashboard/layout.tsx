'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Skip backend profile refresh for demo mode
    if (user?.id === 'demo-001') return;

    authService.getProfile()
      .then(setUser)
      .catch(() => {
        logout();
        router.replace('/login');
      });
  }, [isAuthenticated, user, setUser, logout, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080a' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#08080a' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
      <NotificationCenter />
    </div>
  );
}
