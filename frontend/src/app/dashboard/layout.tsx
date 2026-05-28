'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import Link from 'next/link';
import { LayoutDashboard, FileSignature, FileText, DollarSign, BarChart2 } from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/empenhos', icon: FileSignature, label: 'Empenhos' },
  { href: '/dashboard/licitacoes', icon: FileText, label: 'Licitações' },
  { href: '/dashboard/financeiro', icon: DollarSign, label: 'Financeiro' },
  { href: '/dashboard/relatorios', icon: BarChart2, label: 'Relatórios' },
];

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex items-center justify-around px-2 py-1.5" style={{ background: '#0c0c10', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {mobileNavItems.map(({ href, icon: Icon, label }) => {
        const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors" style={{ color: active ? '#3b82f6' : '#6b7280' }}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

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
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f5f7' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f5f7' }}>
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="p-4 md:p-8 max-w-7xl">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
      <NotificationCenter />
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
