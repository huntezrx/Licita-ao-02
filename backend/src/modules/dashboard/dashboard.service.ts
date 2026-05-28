import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LicitationStatus, TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalLicitations,
      activeLicitations,
      wonLicitations,
      pendingTasks,
      urgentTasks,
      totalContracts,
      activeContracts,
      revenueThisMonth,
      totalNotices,
      pendingNotices,
    ] = await Promise.all([
      this.prisma.licitation.count({ where: { deletedAt: null } }),
      this.prisma.licitation.count({
        where: {
          deletedAt: null,
          status: { in: [LicitationStatus.IN_PROGRESS, LicitationStatus.ANALYZING, LicitationStatus.PROSPECTING] },
        },
      }),
      this.prisma.licitation.count({
        where: { deletedAt: null, status: LicitationStatus.WON },
      }),
      this.prisma.task.count({
        where: { status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
      }),
      this.prisma.task.count({
        where: {
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
          priority: TaskPriority.URGENT,
        },
      }),
      this.prisma.contract.count({ where: { deletedAt: null } }),
      this.prisma.contract.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.financial.aggregate({
        where: {
          type: 'REVENUE',
          date: { gte: startOfMonth },
        },
        _sum: { value: true },
      }),
      this.prisma.notice.count(),
      this.prisma.notice.count({ where: { status: 'PENDING' } }),
    ]);

    // Win rate
    const closedLicitations = await this.prisma.licitation.count({
      where: {
        deletedAt: null,
        status: { in: [LicitationStatus.WON, LicitationStatus.LOST] },
      },
    });

    const winRate = closedLicitations > 0 ? Math.round((wonLicitations / closedLicitations) * 100) : 0;

    return {
      licitations: {
        total: totalLicitations,
        active: activeLicitations,
        won: wonLicitations,
        winRate,
      },
      tasks: {
        pending: pendingTasks,
        urgent: urgentTasks,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
      },
      financial: {
        revenueThisMonth: Number(revenueThisMonth._sum.value || 0),
      },
      notices: {
        total: totalNotices,
        pending: pendingNotices,
      },
    };
  }

  async getRecentActivities(limit = 20) {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async getLicitationsByStatus() {
    const stats = await this.prisma.licitation.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
      _sum: { estimatedValue: true },
    });

    return stats.map((s) => ({
      status: s.status,
      count: s._count.id,
      value: Number(s._sum.estimatedValue || 0),
    }));
  }

  async getUpcomingDeadlines() {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);

    const [licitations, tasks, contracts] = await Promise.all([
      this.prisma.licitation.findMany({
        where: {
          deletedAt: null,
          closingDate: { gte: now, lte: nextWeek },
          status: { in: [LicitationStatus.IN_PROGRESS, LicitationStatus.ANALYZING] },
        },
        orderBy: { closingDate: 'asc' },
        take: 5,
        include: { assignedTo: { select: { id: true, name: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          dueDate: { gte: now, lte: nextWeek },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: { assignedTo: { select: { id: true, name: true } } },
      }),
      this.prisma.contract.findMany({
        where: {
          deletedAt: null,
          endDate: { gte: now, lte: nextWeek },
          status: 'ACTIVE',
        },
        orderBy: { endDate: 'asc' },
        take: 5,
      }),
    ]);

    return { licitations, tasks, contracts };
  }

  async getFinancialChart(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await this.prisma.financial.findMany({
      where: { date: { gte: startDate } },
      select: { type: true, value: true, date: true },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, { revenue: number; expenses: number; month: string }> = {};

    for (let i = months; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      monthlyData[key] = { revenue: 0, expenses: 0, month: label };
    }

    records.forEach((record) => {
      const key = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        if (record.type === 'REVENUE') {
          monthlyData[key].revenue += Number(record.value);
        } else if (record.type === 'EXPENSE') {
          monthlyData[key].expenses += Number(record.value);
        }
      }
    });

    return Object.values(monthlyData);
  }
}
