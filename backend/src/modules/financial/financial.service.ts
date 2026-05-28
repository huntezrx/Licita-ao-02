import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { Prisma, FinancialType, FinancialStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinancialDto {
  @ApiProperty({ enum: FinancialType })
  @IsEnum(FinancialType)
  type: FinancialType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: FinancialStatus })
  @IsOptional()
  @IsEnum(FinancialStatus)
  status?: FinancialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licitationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: FinancialType;
    status?: FinancialStatus;
    licitationId?: string;
    contractId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 20, type, status, licitationId, contractId, startDate, endDate } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.FinancialWhereInput = {
      ...(type && { type }),
      ...(status && { status }),
      ...(licitationId && { licitationId }),
      ...(contractId && { contractId }),
      ...(startDate && { date: { gte: new Date(startDate) } }),
      ...(endDate && {
        date: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [financials, total] = await Promise.all([
      this.prisma.financial.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          licitation: { select: { id: true, number: true, title: true } },
          contract: { select: { id: true, number: true, title: true } },
        },
      }),
      this.prisma.financial.count({ where }),
    ]);

    return paginate(financials, total, page, limit);
  }

  async getSummary(startDate?: string, endDate?: string) {
    const where: Prisma.FinancialWhereInput = {
      ...(startDate && { date: { gte: new Date(startDate) } }),
      ...(endDate && {
        date: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [byType, total] = await Promise.all([
      this.prisma.financial.groupBy({
        by: ['type'],
        where,
        _sum: { value: true },
        _count: { id: true },
      }),
      this.prisma.financial.aggregate({
        where,
        _sum: { value: true },
      }),
    ]);

    const revenue = byType
      .filter((b) => b.type === 'REVENUE')
      .reduce((acc, b) => acc + Number(b._sum.value || 0), 0);

    const expenses = byType
      .filter((b) => b.type === 'EXPENSE')
      .reduce((acc, b) => acc + Number(b._sum.value || 0), 0);

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      byType: byType.map((b) => ({
        type: b.type,
        total: Number(b._sum.value || 0),
        count: b._count.id,
      })),
    };
  }

  async create(dto: CreateFinancialDto) {
    return this.prisma.financial.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(id: string, dto: Partial<CreateFinancialDto>) {
    const financial = await this.prisma.financial.findUnique({ where: { id } });
    if (!financial) throw new NotFoundException('Registro financeiro não encontrado');

    return this.prisma.financial.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    const financial = await this.prisma.financial.findUnique({ where: { id } });
    if (!financial) throw new NotFoundException('Registro financeiro não encontrado');

    await this.prisma.financial.delete({ where: { id } });
    return { message: 'Registro removido com sucesso' };
  }

  async getCashFlow(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await this.prisma.financial.findMany({
      where: { date: { gte: startDate } },
      select: { type: true, value: true, date: true },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

    records.forEach((record) => {
      const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0 };
      }

      const value = Number(record.value);
      if (record.type === 'REVENUE') {
        monthlyData[monthKey].revenue += value;
      } else {
        monthlyData[monthKey].expenses += value;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
      profit: data.revenue - data.expenses,
    }));
  }
}
