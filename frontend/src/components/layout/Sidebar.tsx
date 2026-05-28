'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  DollarSign,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  {
    group: 'Principal',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Empenhos', href: '/dashboard/empenhos', icon: FileSignature },
      { name: 'Licitações', href: '/dashboard/licitacoes', icon: FileText },
    ],
  },
  {
    group: 'Financeiro',
    items: [
      { name: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
      { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart2 },
    ],
  },
  {
    group: 'Conta',
    items: [
      { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 252 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{ background: '#060810', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 20px rgba(124,58,237,0.45), 0 4px 12px rgba(0,0,0,0.4)' }}>
          <FileSignature className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-black text-white leading-tight whitespace-nowrap tracking-tight">
                LicitaNex
              </p>
              <p className="text-[10px] whitespace-nowrap" style={{ color: '#a78bfa' }}>Gestão Pública</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-5">
        {navigation.map((group) => (
          <div key={group.group}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5 px-3"
                  style={{ color: 'rgba(100,116,139,0.7)' }}
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group',
                        active
                          ? 'bg-violet-500/[0.1]'
                          : 'hover:bg-white/[0.04]',
                      )}
                    >
                      {/* Left neon accent bar when active */}
                      {active && (
                        <motion.div
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.9), 0 0 16px rgba(167,139,250,0.5)' }}
                          transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                        />
                      )}
                      <Icon
                        className={cn('w-[18px] h-[18px] flex-shrink-0 transition-colors', active ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300')}
                      />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.13 }}
                            className={cn('text-sm font-medium whitespace-nowrap overflow-hidden transition-colors', active ? 'text-violet-200' : 'text-slate-400 group-hover:text-slate-200')}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(100,116,139,0.8)' }}>{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all"
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 8px rgba(0,0,0,0.5)' }}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-400" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-400" />
        )}
      </button>
    </motion.aside>
  );
}
