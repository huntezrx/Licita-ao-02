'use client';

import { Bell, AlertTriangle, CheckCircle2, Info, Trophy, FileText } from 'lucide-react';
import { Notification } from '@/types/notification.types';
import { formatRelativeTime } from '@/lib/formatters';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; class: string; bg: string }> = {
  INFO: { icon: Info, class: 'text-blue-400', bg: 'bg-blue-500/10' },
  SUCCESS: { icon: CheckCircle2, class: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WARNING: { icon: AlertTriangle, class: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ERROR: { icon: AlertTriangle, class: 'text-red-400', bg: 'bg-red-500/10' },
  DEADLINE: { icon: Bell, class: 'text-orange-400', bg: 'bg-orange-500/10' },
  CONTRACT_WON: { icon: Trophy, class: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  NEW_NOTICE: { icon: FileText, class: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG['INFO'];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
        notification.read
          ? 'border-transparent hover:bg-slate-800/50'
          : 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10'
      }`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0 h-fit`}>
        <Icon className={`w-4 h-4 ${config.class}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-slate-600 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}
