import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, params: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { page = 1, limit = 20, unreadOnly } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {
      userId,
      ...(unreadOnly && { read: false }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginate(notifications, total, page, limit);
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { message: 'Todas as notificações marcadas como lidas' };
  }

  async create(params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    data?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || NotificationType.INFO,
        data: params.data,
      },
    });
  }

  async createBulk(
    userIds: string[],
    notification: {
      title: string;
      message: string;
      type?: NotificationType;
      data?: Record<string, unknown>;
    },
  ) {
    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || NotificationType.INFO,
        data: notification.data,
      })),
    });
  }

  async delete(id: string, userId: string) {
    await this.prisma.notification.deleteMany({
      where: { id, userId },
    });
    return { message: 'Notificação removida' };
  }
}
