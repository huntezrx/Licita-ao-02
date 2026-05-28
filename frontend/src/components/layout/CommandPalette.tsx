'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, FileText, Newspaper, FileSignature,
  Send, Building2, DollarSign, FolderOpen, Bot, CheckSquare,
  BarChart2, Settings, Shield, User, Zap,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const commands = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'Navegação' },
  { id: 'licitations', label: 'Licitações', href: '/licitacoes', icon: FileText, category: 'Navegação' },
  { id: 'notices', label: 'Editais', href: '/editais', icon: Newspaper, category: 'Navegação' },
  { id: 'contracts', label: 'Contratos', href: '/contratos', icon: FileSignature, category: 'Navegação' },
  { id: 'proposals', label: 'Propostas', href: '/propostas', icon: Send, category: 'Navegação' },
  { id: 'crm', label: 'CRM', href: '/crm', icon: Building2, category: 'CRM' },
  { id: 'pipeline', label: 'Pipeline', href: '/crm/pipeline', icon: Zap, category: 'CRM' },
  { id: 'financial', label: 'Financeiro', href: '/financeiro', icon: DollarSign, category: 'Gestão' },
  { id: 'documents', label: 'Documentos', href: '/documentos', icon: FolderOpen, category: 'Gestão' },
  { id: 'tasks', label: 'Tarefas', href: '/tarefas', icon: CheckSquare, category: 'Gestão' },
  { id: 'ai', label: 'Assistente IA', href: '/ia', icon: Bot, category: 'Inteligência' },
  { id: 'reports', label: 'Relatórios', href: '/relatorios', icon: BarChart2, category: 'Inteligência' },
  { id: 'profile', label: 'Meu Perfil', href: '/perfil', icon: User, category: 'Conta' },
  { id: 'settings', label: 'Configurações', href: '/configuracoes', icon: Settings, category: 'Conta' },
  { id: 'admin', label: 'Administração', href: '/admin', icon: Shield, category: 'Conta' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = useCallback((href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
    setQuery('');
  }, [router, setCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex].href);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, handleSelect]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar páginas, ações..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
                />
                <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">ESC</kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  filteredCommands.map((cmd, index) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                          index === selectedIndex
                            ? 'bg-blue-500/10 text-blue-300'
                            : 'text-slate-300 hover:bg-slate-800',
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{cmd.label}</span>
                        <span className="text-xs text-slate-500">{cmd.category}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
