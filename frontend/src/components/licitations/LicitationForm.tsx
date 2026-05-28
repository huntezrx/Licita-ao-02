'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createLicitationSchema, CreateLicitationFormData } from '@/lib/validators';
import { TagInput } from '@/components/common/TagInput';
import { MODALITY_LABELS } from '@/lib/constants';
import { LicitationModality } from '@/types/licitation.types';

interface LicitationFormProps {
  onSubmit: (data: CreateLicitationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateLicitationFormData>;
  title?: string;
}

export function LicitationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  title = 'Nova Licitação',
}: LicitationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLicitationFormData>({
    resolver: zodResolver(createLicitationSchema),
    defaultValues: {
      status: 'PROSPECTING',
      tags: [],
      ...defaultValues,
    },
  });

  const tags = watch('tags') ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Number & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Número <span className="text-red-400">*</span>
              </label>
              <input
                {...register('number')}
                placeholder="Ex: 001/2025"
                className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                  errors.number ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.number && (
                <p className="text-xs text-red-400 mt-1">{errors.number.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                {...register('title')}
                placeholder="Descrição da licitação"
                className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                  errors.title ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Organ */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Órgão <span className="text-red-400">*</span>
            </label>
            <input
              {...register('organ')}
              placeholder="Ex: Prefeitura Municipal de São Paulo"
              className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                errors.organ ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.organ && (
              <p className="text-xs text-red-400 mt-1">{errors.organ.message}</p>
            )}
          </div>

          {/* Modality & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Modalidade <span className="text-red-400">*</span>
              </label>
              <select
                {...register('modality')}
                className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                  errors.modality ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              >
                <option value="" disabled>Selecione...</option>
                {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.modality && (
                <p className="text-xs text-red-400 mt-1">{errors.modality.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              >
                <option value="PROSPECTING">Prospecção</option>
                <option value="ANALYZING">Em análise</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="SUBMITTED">Submetida</option>
              </select>
            </div>
          </div>

          {/* Estimated Value & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Valor Estimado (R$)
              </label>
              <input
                {...register('estimatedValue', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
              <input
                {...register('category')}
                placeholder="Ex: Tecnologia, Obras, Serviços"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Data de Abertura
              </label>
              <input
                {...register('openingDate')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Data de Encerramento
              </label>
              <input
                {...register('closingDate')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Edital URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">URL do Edital</label>
            <input
              {...register('editalUrl')}
              type="url"
              placeholder="https://..."
              className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                errors.editalUrl ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.editalUrl && (
              <p className="text-xs text-red-400 mt-1">{errors.editalUrl.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descreva os detalhes da licitação..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label>
            <TagInput
              value={tags}
              onChange={(t) => setValue('tags', t)}
              placeholder="Adicionar tag (Enter para confirmar)..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                'Salvar Licitação'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
