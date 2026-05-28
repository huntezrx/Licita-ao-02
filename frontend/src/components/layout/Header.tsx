'use client';

import { useState } from 'react';
import { Search, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user } = useAuthStore();
  const { unreadCount, togglePanel } = useNotificationStore();
  const { setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = (() => {
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/dashboard/empenhos': 'Empenhos',
      '/dashboard/licitacoes': 'Licitações',
      '/dashboard/financeiro': 'Financeiro',
      '/dashboard/relatorios': 'Relatórios',
      '/dashboard/configuracoes': 'Configurações',
    };
    for (const [path, title] of Object.entries(map)) {
      if (pathname === path || pathname.startsWith(path + '/')) return title;
    }
    return 'Dashboard';
  })();

  return (
    <header className="h-12 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: '#0c0c10', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-[13px] font-medium" style={{ color: '#7f7f8c' }}>{pageTitle}</span>

      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
          style={{ color: '#44444f', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Buscar</span>
          <kbd className="hidden sm:block text-[10px] px-1 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#44444f' }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={togglePanel}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: '#44444f' }}
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ml-1"
            style={{ color: '#7f7f8c' }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: '#1c2033', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl z-20 overflow-hidden py-1"
                style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[12px] font-medium" style={{ color: '#f0f0f2' }}>{user?.name}</p>
                  <p className="text-[11px]" style={{ color: '#44444f' }}>{user?.email}</p>
                </div>
                <div className="p-1">
                  {[
                    { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] transition-colors"
                      style={{ color: '#7f7f8c' }}
                    >
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] transition-colors"
                    style={{ color: '#f87171' }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
