'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
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
    toast.success('Configurações salvas');
    setTimeout(() => setSaved(false), 2500);
  }

  const inputCls = 'input-premium';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="surface rounded-xl overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl pb-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.02em' }}>Configurações</h1>
        <p className="text-sm mt-0.5" style={{ color: '#44444f' }}>Preferências da conta</p>
      </div>

      <Section title="Perfil">
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'Nome completo', key: 'name' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Telefone', key: 'phone', type: 'tel' },
            { label: 'Cargo', key: 'cargo' },
            { label: 'Empresa', key: 'empresa', full: true },
          ] as { label: string; key: keyof typeof profile; type?: string; full?: boolean }[]).map(({ label, key, type, full }) => (
            <div key={key} className={full ? 'col-span-2' : ''}>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>{label}</label>
              <input type={type || 'text'} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Notificações">
        <div className="space-y-1">
          {[
            { key: 'email' as const, label: 'Notificações por e-mail', desc: 'Atualizações enviadas ao seu e-mail' },
            { key: 'empenhosPendentes' as const, label: 'Empenhos pendentes', desc: 'Alertas de empenhos não resolvidos' },
            { key: 'novasLicitacoes' as const, label: 'Novas licitações', desc: 'Notificações de novas oportunidades' },
            { key: 'vencimentos' as const, label: 'Vencimentos próximos', desc: 'Alertas 3 dias antes do prazo' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#d4d4d8' }}>{label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#44444f' }}>{desc}</p>
              </div>
              <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                style={{ background: notifs[key] ? '#3b82f6' : 'rgba(255,255,255,0.08)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: notifs[key] ? 'calc(100% - 18px)' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Segurança">
        <div className="space-y-2">
          {[
            { label: 'Alterar Senha', desc: 'Última alteração: nunca' },
            { label: 'Autenticação 2FA', desc: 'Adicione uma camada extra de segurança' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#d4d4d8' }}>{item.label}</p>
                <p className="text-[11px]" style={{ color: '#44444f' }}>{item.desc}</p>
              </div>
              <button onClick={() => toast.info('Disponível com backend')} className="btn-ghost text-[12px] py-1.5 px-3">Configurar</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sistema">
        <div className="space-y-2">
          {[['Versão', '1.0.0 Demo'], ['Modo', 'Demonstração'], ['Papel', user?.role || 'SUPER_ADMIN'], ['Dados', 'LocalStorage']].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1">
              <span style={{ color: '#44444f' }}>{k}</span>
              <span style={{ color: '#7f7f8c' }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <button onClick={handleSave}
        className="flex items-center gap-2 btn-primary"
        style={{ padding: '9px 20px' }}>
        {saved && <Check className="w-3.5 h-3.5" />}
        {saved ? 'Salvo!' : 'Salvar Configurações'}
      </button>
    </div>
  );
}
