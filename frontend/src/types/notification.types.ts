export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REMINDER' | 'DEADLINE';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
}
