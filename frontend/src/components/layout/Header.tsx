'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, LogOut, User, Settings, ChevronDown, Command } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user } = useAuthStore();
  const { unreadCount, togglePanel } = useNotificationStore();
  const { setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const routes: Record<string, string> = {
      '/': 'Dashboard',
      '/licitacoes': 'Licitações',
      '/editais': 'Editais',
      '/contratos': 'Contratos',
      '/propostas': 'Propostas',
      '/crm': 'CRM',
      '/crm/pipeline': 'Pipeline de Vendas',
      '/financeiro': 'Financeiro',
      '/documentos': 'Documentos',
      '/ia': 'Assistente IA',
      '/tarefas': 'Tarefas',
      '/equipes': 'Equipes',
      '/relatorios': 'Relatórios',
      '/configuracoes': 'Configurações',
      '/admin': 'Administração',
      '/perfil': 'Meu Perfil',
    };

    for (const [path, title] of Object.entries(routes)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Dashboard';
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 relative z-10" style={{ background: 'rgba(6,8,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold text-slate-200 tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-300 transition-colors group"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block">Pesquisar...</span>
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-400 group-hover:bg-slate-600">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={togglePanel}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl z-20 overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" /> Meu Perfil
                  </Link>
                  <Link
                    href="/configuracoes"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Configurações
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sair
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
