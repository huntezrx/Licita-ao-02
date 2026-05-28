import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../../common/utils/pagination.util';
import { Prisma, LeadStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];
}

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: LeadStatus;
    assignedToId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, assignedToId, search } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.LeadWhereInput = {
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return paginate(leads, total, page, limit);
  }

  async getPipelineStats() {
    const stats = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { value: true },
    });

    return stats.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalValue: Number(s._sum.value || 0),
    }));
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true } },
        tasks: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!lead) throw new NotFoundException('Lead não encontrado');
    return lead;
  }

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        tags: dto.tags || [],
      },
    });
  }

  async update(id: string, dto: Partial<CreateLeadDto>) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    const closedAt =
      dto.status === LeadStatus.WON || dto.status === LeadStatus.LOST
        ? new Date()
        : undefined;

    return this.prisma.lead.update({
      where: { id },
      data: { ...dto, ...(closedAt && { closedAt }) },
    });
  }

  async remove(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead removido com sucesso' };
  }
}
