'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, FileSignature, DollarSign, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { group: 'Principal', items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Empenhos', href: '/dashboard/empenhos', icon: FileSignature },
    { name: 'Licitações', href: '/dashboard/licitacoes', icon: FileText },
  ]},
  { group: 'Financeiro', items: [
    { name: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
    { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart2 },
  ]},
  { group: 'Sistema', items: [
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 52 : 216 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-full flex-shrink-0"
      style={{ background: '#0c0c10', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-white">
          <Image src="/logo-icon.png" alt="Impacta" width={32} height={32} style={{ objectFit: 'contain' }} />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-[12px] font-bold whitespace-nowrap leading-tight" style={{ color: '#f0f0f2' }}>IMPACTA</p>
              <p className="text-[9px] whitespace-nowrap" style={{ color: '#44444f', letterSpacing: '0.06em' }}>EMPREENDIMENTOS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4 mt-1">
        {navigation.map((group) => (
          <div key={group.group}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="label-section px-2 mb-1"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      'relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg transition-all duration-150 cursor-pointer',
                      active ? 'bg-[#1c1c28]' : 'hover:bg-[#161619]',
                    )}>
                      {active && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                          style={{ background: '#3b82f6' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <Icon className={cn(
                        'w-[15px] h-[15px] flex-shrink-0 transition-colors',
                        active ? 'text-[#60a5fa]' : 'text-[#44444f]',
                      )} />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                            style={{ color: active ? '#d4d4f0' : '#7f7f8c' }}
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

      {/* User */}
      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-lg', 'hover:bg-[#161619] transition-colors cursor-default')}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{ background: '#1c2033', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p className="text-[12px] font-medium truncate" style={{ color: '#d4d4d8' }}>{user?.name}</p>
                <p className="text-[10px] truncate" style={{ color: '#44444f' }}>{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors"
        style={{ background: '#161619', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {sidebarCollapsed
          ? <ChevronRight className="w-3 h-3" style={{ color: '#44444f' }} />
          : <ChevronLeft className="w-3 h-3" style={{ color: '#44444f' }} />
        }
      </button>
    </motion.aside>
  );
}
