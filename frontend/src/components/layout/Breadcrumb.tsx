'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  licitacoes: 'Licitações',
  contratos: 'Contratos',
  propostas: 'Propostas',
  financeiro: 'Financeiro',
  documentos: 'Documentos',
  tarefas: 'Tarefas',
  editais: 'Editais',
  crm: 'CRM',
  pipeline: 'Pipeline',
  ia: 'Assistente IA',
  relatorios: 'Relatórios',
  equipes: 'Equipes',
  admin: 'Administração',
  perfil: 'Perfil',
  configuracoes: 'Configurações',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = PATH_LABELS[segment] ?? segment;
    const isLast = index === segments.length - 1;
    // Detect UUIDs (detail pages)
    const isId = /^[0-9a-f-]{36}$/i.test(segment);

    return { href, label: isId ? 'Detalhes' : label, isLast };
  });

  // Don't render if on root dashboard
  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4">
      <Link href="/dashboard" className="p-1 hover:text-white transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-slate-700" />
          {crumb.isLast ? (
            <span className="text-slate-300 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-white transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
