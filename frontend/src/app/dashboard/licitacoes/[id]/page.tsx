'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Building2, DollarSign, FileText,
  Edit2, Trash2, ExternalLink, Clock, Users, CheckSquare,
  Package, Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { licitationsService } from '@/services/licitations.service';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorState } from '@/components/common/ErrorState';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LICITATION_STATUS_LABELS, MODALITY_LABELS } from '@/lib/constants';
import { LicitationStatus, LicitationModality } from '@/types/licitation.types';

export default function LicitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: licitation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['licitations', id],
    queryFn: () => licitationsService.findOne(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => licitationsService.remove(id),
    onSuccess: () => {
      toast.success('Licitação removida com sucesso');
      queryClient.invalidateQueries({ queryKey: ['licitations'] });
      router.push('/dashboard/licitacoes');
    },
    onError: () => toast.error('Erro ao remover licitação'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <SkeletonLoader count={1} height="h-10" className="max-w-xs" />
        <SkeletonLoader count={3} height="h-32" />
      </div>
    );
  }

  if (error || !licitation) {
    return (
      <ErrorState
        title="Licitação não encontrada"
        message="Esta licitação não existe ou você não tem permissão para visualizá-la."
        onRetry={() => refetch()}
      />
    );
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-slate-800 rounded-lg flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-white">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={licitation.status} type="licitation" />
              <span className="text-slate-500 text-sm">{licitation.number}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{licitation.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{licitation.organ}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {licitation.editalUrl && (
            <a
              href={licitation.editalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Edital
            </a>
          )}
          <button
            type="button"
            onClick={() => toast('Edição em breve', { icon: '🔧' })}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza que deseja remover esta licitação?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-base font-semibold text-white mb-5">Informações Gerais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow
                icon={Building2}
                label="Órgão"
                value={licitation.organ}
              />
              <InfoRow
                icon={FileText}
                label="Modalidade"
                value={MODALITY_LABELS[licitation.modality as LicitationModality] ?? licitation.modality}
              />
              <InfoRow
                icon={DollarSign}
                label="Valor Estimado"
                value={
                  licitation.estimatedValue
                    ? formatCurrency(licitation.estimatedValue)
                    : '--'
                }
              />
              <InfoRow
                icon={DollarSign}
                label="Valor Final"
                value={
                  licitation.finalValue
                    ? formatCurrency(licitation.finalValue)
                    : '--'
                }
              />
              <InfoRow
                icon={Calendar}
                label="Abertura"
                value={licitation.openingDate ? formatDate(licitation.openingDate) : '--'}
              />
              <InfoRow
                icon={Clock}
                label="Encerramento"
                value={licitation.closingDate ? formatDate(licitation.closingDate) : '--'}
              />
              {licitation.category && (
                <InfoRow icon={Tag} label="Categoria" value={licitation.category} />
              )}
              {licitation.assignedTo && (
                <InfoRow
                  icon={Users}
                  label="Responsável"
                  value={
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={licitation.assignedTo.name}
                        avatar={licitation.assignedTo.avatar}
                        size="xs"
                      />
                      <span>{licitation.assignedTo.name}</span>
                    </div>
                  }
                />
              )}
            </div>
          </motion.div>

          {/* Description */}
          {licitation.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <h2 className="text-base font-semibold text-white mb-3">Descrição</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {licitation.description}
              </p>
            </motion.div>
          )}

          {/* Tags */}
          {licitation.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <h2 className="text-base font-semibold text-white mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {licitation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Stats & Meta */}
        <div className="space-y-4">
          {/* Counters */}
          {licitation._count && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Associações</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: 'Documentos', count: licitation._count.documents },
                  { icon: Package, label: 'Propostas', count: licitation._count.proposals },
                  { icon: CheckSquare, label: 'Tarefas', count: licitation._count.tasks },
                  { icon: FileText, label: 'Contratos', count: licitation._count.contracts },
                ].map(({ icon: Icon, label, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* External IDs */}
          {(licitation.pncpId || licitation.comprasnetId) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">IDs Externos</h3>
              <div className="space-y-2">
                {licitation.pncpId && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">PNCP</p>
                    <p className="text-xs font-mono text-blue-300 break-all">{licitation.pncpId}</p>
                  </div>
                )}
                {licitation.comprasnetId && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">ComprasNet</p>
                    <p className="text-xs font-mono text-blue-300 break-all">
                      {licitation.comprasnetId}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Timestamps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Histórico</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Criado em</p>
                <p className="text-sm text-slate-300">{formatDate(licitation.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Atualizado em</p>
                <p className="text-sm text-slate-300">{formatDate(licitation.updatedAt)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
