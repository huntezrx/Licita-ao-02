'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification.types';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const typeConfig = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SUCCESS: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ERROR: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  REMINDER: { icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  DEADLINE: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotifications();
  const config = typeConfig[notification.type] || typeConfig.INFO;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg transition-colors cursor-pointer group',
        notification.read ? 'opacity-60 hover:opacity-100' : 'bg-slate-800/50 hover:bg-slate-800',
      )}
      onClick={() => !notification.read && markAsRead(notification.id)}
    >
      <div className={cn('p-2 rounded-lg flex-shrink-0', config.bg)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white leading-tight">{notification.title}</p>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { panelOpen, setPanelOpen, notifications } = useNotificationStore();
  const { markAllAsRead } = useNotifications();

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-20 w-96 max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Notificações</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Marcar todas
                </button>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
