'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  FileSignature,
  Send,
  Users,
  DollarSign,
  FolderOpen,
  Bot,
  CheckSquare,
  BarChart2,
  Settings,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Building2,
  Zap,
  Globe,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  {
    group: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Licitações', href: '/licitacoes', icon: FileText },
      { name: 'Editais', href: '/editais', icon: Newspaper },
      { name: 'Contratos', href: '/contratos', icon: FileSignature },
      { name: 'Propostas', href: '/propostas', icon: Send },
    ],
  },
  {
    group: 'CRM',
    items: [
      { name: 'Pipeline', href: '/crm/pipeline', icon: Zap },
      { name: 'CRM', href: '/crm', icon: Building2 },
    ],
  },
  {
    group: 'Gestão',
    items: [
      { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
      { name: 'Documentos', href: '/documentos', icon: FolderOpen },
      { name: 'Tarefas', href: '/tarefas', icon: CheckSquare },
      { name: 'Equipes', href: '/equipes', icon: Users },
    ],
  },
  {
    group: 'Inteligência',
    items: [
      { name: 'Assistente IA', href: '/ia', icon: Bot },
      { name: 'Relatórios', href: '/relatorios', icon: BarChart2 },
      { name: 'Rastreador', href: '/crawler', icon: Globe },
    ],
  },
  {
    group: 'Conta',
    items: [
      { name: 'Perfil', href: '/perfil', icon: User },
      { name: 'Configurações', href: '/configuracoes', icon: Settings },
      { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">
                SistemaLicitação
              </p>
              <p className="text-xs text-slate-400 whitespace-nowrap">Gestão Pública</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.group}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.adminOnly && user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
                  return null;
                }

                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={cn(
                        'flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors cursor-pointer group',
                        active
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200',
                        )}
                      />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-0 w-1 h-6 bg-blue-400 rounded-l-full"
                          transition={{ type: 'spring', bounce: 0.2 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
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
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors z-10"
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
