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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#03040a' }}>
      {/* Ambient neon background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[600px] rounded-full opacity-100"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.09) 0%, transparent 70%)', filter: 'blur(1px)' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(1px)' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
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
