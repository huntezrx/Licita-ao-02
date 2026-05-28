import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LicitationStatus, LicitationModality } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getLicitationsReport(params: {
    startDate?: string;
    endDate?: string;
    status?: LicitationStatus;
    modality?: LicitationModality;
  }) {
    const { startDate, endDate, status, modality } = params;

    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(modality && { modality }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && {
        createdAt: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [licitations, byStatus, byModality, winRate] = await Promise.all([
      this.prisma.licitation.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { proposals: true, documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.licitation.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { estimatedValue: true },
      }),
      this.prisma.licitation.groupBy({
        by: ['modality'],
        where,
        _count: { id: true },
      }),
      this.prisma.licitation.groupBy({
        by: ['status'],
        where: {
          ...where,
          status: { in: [LicitationStatus.WON, LicitationStatus.LOST] },
        },
        _count: { id: true },
      }),
    ]);

    const won = winRate.find((w) => w.status === LicitationStatus.WON)?._count.id || 0;
    const lost = winRate.find((w) => w.status === LicitationStatus.LOST)?._count.id || 0;
    const total = won + lost;

    return {
      licitations,
      summary: {
        total: licitations.length,
        byStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
          value: Number(s._sum.estimatedValue || 0),
        })),
        byModality: byModality.map((m) => ({
          modality: m.modality,
          count: m._count.id,
        })),
        winRate: total > 0 ? Math.round((won / total) * 100) : 0,
        totalWon: won,
        totalLost: lost,
      },
    };
  }

  async getFinancialReport(params: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params;

    const where = {
      ...(startDate && { date: { gte: new Date(startDate) } }),
      ...(endDate && {
        date: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [records, byType, byCategory] = await Promise.all([
      this.prisma.financial.findMany({
        where,
        include: {
          licitation: { select: { id: true, number: true, title: true } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.financial.groupBy({
        by: ['type'],
        where,
        _sum: { value: true },
        _count: { id: true },
      }),
      this.prisma.financial.groupBy({
        by: ['category'],
        where,
        _sum: { value: true },
        _count: { id: true },
      }),
    ]);

    const revenue = byType
      .filter((b) => b.type === 'REVENUE')
      .reduce((acc, b) => acc + Number(b._sum.value || 0), 0);

    const expenses = byType
      .filter((b) => b.type !== 'REVENUE')
      .reduce((acc, b) => acc + Number(b._sum.value || 0), 0);

    return {
      records,
      summary: {
        revenue,
        expenses,
        profit: revenue - expenses,
        byType: byType.map((b) => ({
          type: b.type,
          total: Number(b._sum.value || 0),
          count: b._count.id,
        })),
        byCategory: byCategory.map((c) => ({
          category: c.category,
          total: Number(c._sum.value || 0),
          count: c._count.id,
        })),
      },
    };
  }

  async getPerformanceReport() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [topUsers, taskCompletion, aiUsage] = await Promise.all([
      this.prisma.licitation.groupBy({
        by: ['assignedToId'],
        where: { deletedAt: null, assignedToId: { not: null } },
        _count: { id: true },
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.aIHistory.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startOfYear } },
        _count: { id: true },
        _sum: { tokens: true, cost: true },
      }),
    ]);

    return {
      topUsers,
      taskCompletion: taskCompletion.map((t) => ({
        status: t.status,
        count: t._count.id,
      })),
      aiUsage: aiUsage.map((a) => ({
        type: a.type,
        count: a._count.id,
        tokens: a._sum.tokens,
        cost: Number(a._sum.cost || 0),
      })),
    };
  }
}
