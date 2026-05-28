'use client';

import { Settings, Bell, Globe, Palette, Shield } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Personalize o sistema</p>
      </div>

      {[
        {
          icon: Bell,
          title: 'Notificações',
          desc: 'Gerencie como você recebe alertas e notificações',
          color: 'text-blue-400',
        },
        {
          icon: Palette,
          title: 'Aparência',
          desc: 'Tema escuro, tipografia e preferências de exibição',
          color: 'text-purple-400',
        },
        {
          icon: Globe,
          title: 'Integrações',
          desc: 'Configure conexões com PNCP, ComprasNet e outros sistemas',
          color: 'text-emerald-400',
        },
        {
          icon: Shield,
          title: 'Segurança',
          desc: 'Sessões ativas, histórico de acesso e logs de segurança',
          color: 'text-orange-400',
        },
      ].map((item) => (
        <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-800 rounded-xl">
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors">
            Configurar
          </button>
        </div>
      ))}
    </div>
  );
}
