'use client';

import { useState } from 'react';
import { User, Bell, Shield, Building2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Administrador Demo',
    email: user?.email || 'admin@licitanex.com.br',
    phone: '(11) 99999-0000',
    cargo: 'Administrador do Sistema',
    empresa: 'Empresa Licitante LTDA',
  });
  const [notifs, setNotifs] = useState({ email: true, empenhosPendentes: true, novasLicitacoes: true, vencimentos: false });

  function handleSave() {
    setSaved(true);
    toast.success('Configurações salvas com sucesso!');
    setTimeout(() => setSaved(false), 3000);
  }

  const inputCls = 'w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder-slate-600';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold gradient-title glow-title">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie suas preferências e dados da conta</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-blue-500/10"><User className="w-4 h-4 text-blue-400" /></div>
          <h2 className="font-semibold text-white">Perfil</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {([
            { label: 'Nome completo', key: 'name' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Telefone', key: 'phone', type: 'tel' },
            { label: 'Cargo', key: 'cargo' },
            { label: 'Empresa', key: 'empresa', full: true },
          ] as { label: string; key: keyof typeof profile; type?: string; full?: boolean }[]).map(({ label, key, type, full }) => (
            <div key={key} className={full ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <input type={type || 'text'} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-violet-500/10"><Bell className="w-4 h-4 text-violet-400" /></div>
          <h2 className="font-semibold text-white">Notificações</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'email' as const, label: 'Notificações por e-mail', desc: 'Receba atualizações no seu e-mail' },
            { key: 'empenhosPendentes' as const, label: 'Empenhos pendentes', desc: 'Alertas de empenhos não resolvidos' },
            { key: 'novasLicitacoes' as const, label: 'Novas licitações', desc: 'Notificações de novas oportunidades' },
            { key: 'vencimentos' as const, label: 'Vencimentos próximos', desc: 'Alertas 3 dias antes do vencimento' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                className={`relative w-11 h-6 rounded-full transition-all ${notifs[key] ? 'bg-gradient-to-r from-violet-600 to-blue-600' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifs[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-emerald-500/10"><Shield className="w-4 h-4 text-emerald-400" /></div>
          <h2 className="font-semibold text-white">Segurança</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Alterar Senha</p>
              <p className="text-xs text-slate-400">Última alteração: nunca</p>
            </div>
            <button onClick={() => toast.info('Disponível na versão com backend')} className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium transition-all">Alterar</button>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Autenticação em 2 Fatores</p>
              <p className="text-xs text-slate-400">Adicione uma camada extra de segurança</p>
            </div>
            <button onClick={() => toast.info('Disponível na versão com backend')} className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium transition-all">Ativar</button>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-amber-500/10"><Building2 className="w-4 h-4 text-amber-400" /></div>
          <h2 className="font-semibold text-white">Dados do Sistema</h2>
        </div>
        <div className="p-6">
          <div className="glass-card rounded-xl p-4 space-y-2">
            {[['Versão', '1.0.0 Demo'], ['Modo', 'Demonstração (sem backend)'], ['Usuário', user?.role || 'SUPER_ADMIN'], ['Armazenamento', 'LocalStorage (navegador)']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg ${saved ? 'bg-emerald-600 text-white shadow-emerald-500/25' : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-violet-500/25'}`}>
        {saved && <Check className="w-4 h-4" />}
        {saved ? 'Salvo!' : 'Salvar Configurações'}
      </button>
    </div>
  );
}
