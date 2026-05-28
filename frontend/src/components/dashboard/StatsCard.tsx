'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  format?: (v: number | string) => string;
  gradient?: string;
  delay?: number;
}

function useCountUp(end: number, duration = 1000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof end !== 'number') return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  format,
  gradient = 'from-blue-500/10 to-violet-500/10',
  delay = 0,
}: StatsCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
  const animatedValue = useCountUp(numericValue);

  const displayValue = format
    ? format(typeof value === 'number' ? animatedValue : value)
    : animatedValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br border border-slate-700/50 p-5',
        gradient,
      )}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            {icon}
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                trend > 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : trend < 0
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-slate-500/10 text-slate-400',
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tabular-nums">{displayValue}</p>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          {trendLabel && <p className="text-xs text-slate-500">{trendLabel}</p>}
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />
    </motion.div>
  );
}
