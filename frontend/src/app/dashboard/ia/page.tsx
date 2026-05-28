'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot, Sparkles, FileText, AlertTriangle, Send, List,
  TrendingUp, DollarSign
} from 'lucide-react';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { aiService } from '@/services/ai.service';
import { licitationsService } from '@/services/licitations.service';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AI_FEATURES = [
  {
    id: 'summarize',
    icon: FileText,
    title: 'Resumir Edital',
    description: 'Análise executiva completa da licitação',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'risks',
    icon: AlertTriangle,
    title: 'Analisar Riscos',
    description: 'Identificação de riscos jurídicos e operacionais',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    id: 'proposal',
    icon: Send,
    title: 'Gerar Proposta',
    description: 'Proposta comercial estruturada automaticamente',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'requirements',
    icon: List,
    title: 'Extrair Requisitos',
    description: 'Lista completa de documentos e requisitos',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export default function IAPage() {
  const [selectedLicitation, setSelectedLicitation] = useState<string>('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: licitations } = useQuery({
    queryKey: ['licitations', 'for-ai'],
    queryFn: () => licitationsService.findAll({ limit: 50 }),
  });

  const handleAction = async (actionId: string) => {
    if (!selectedLicitation) {
      toast.error('Selecione uma licitação primeiro');
      return;
    }

    setActiveAction(actionId);
    setIsProcessing(true);
    setResult('');

    try {
      let response;
      switch (actionId) {
        case 'summarize':
          response = await aiService.summarize(selectedLicitation);
          break;
        case 'risks':
          response = await aiService.analyzeRisks(selectedLicitation);
          break;
        case 'proposal':
          response = await aiService.generateProposal(selectedLicitation);
          break;
        case 'requirements':
          response = await aiService.extractRequirements(selectedLicitation);
          break;
      }
      setResult(response?.response || '');
      toast.success('Análise concluída!');
    } catch {
      toast.error('Erro ao processar análise. Verifique a configuração da API de IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assistente IA</h1>
        <p className="text-slate-400 text-sm mt-1">
          Análise inteligente de licitações com tecnologia OpenAI GPT-4
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Licitation Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-3">Selecionar Licitação</h3>
            <select
              value={selectedLicitation}
              onChange={(e) => setSelectedLicitation(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Selecionar licitação --</option>
              {licitations?.data.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.number} - {l.title.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Action Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-3">Análises Disponíveis</h3>
            <div className="space-y-2">
              {AI_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleAction(feature.id)}
                    disabled={isProcessing || !selectedLicitation}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      activeAction === feature.id
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50',
                      (!selectedLicitation || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', feature.bg)}>
                      <Icon className={cn('w-4 h-4', feature.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{feature.title}</p>
                      <p className="text-xs text-slate-400">{feature.description}</p>
                    </div>
                    {isProcessing && activeAction === feature.id && (
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Resultado da Análise</h3>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {result}
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="xl:col-span-3" style={{ height: '700px' }}>
          <ChatInterface licitationId={selectedLicitation} />
        </div>
      </div>
    </div>
  );
}
