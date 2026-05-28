import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalLicitations,
      totalContracts,
      totalDocuments,
      totalNotifications,
      aiUsageToday,
      crawlerJobsToday,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.licitation.count({ where: { deletedAt: null } }),
      this.prisma.contract.count({ where: { deletedAt: null } }),
      this.prisma.document.count(),
      this.prisma.notification.count(),
      this.prisma.aIHistory.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.crawlerJob.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      licitations: totalLicitations,
      contracts: totalContracts,
      documents: totalDocuments,
      notifications: totalNotifications,
      ai: { requestsToday: aiUsageToday },
      crawler: { jobsToday: crawlerJobsToday },
    };
  }

  async getAuditLogs(params: { page?: number; limit?: number; userId?: string; resource?: string }) {
    const { page = 1, limit = 20, userId, resource } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {
      ...(userId && { userId }),
      ...(resource && { resource }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginate(logs, total, page, limit);
  }

  async createAuditLog(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  async getUsersWithStats() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            assignedLicitations: true,
            assignedTasks: true,
            aiHistories: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
