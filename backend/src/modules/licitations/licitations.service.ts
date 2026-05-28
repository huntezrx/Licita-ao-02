import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLicitationDto,
  UpdateLicitationDto,
  FilterLicitationDto,
} from './dto/create-licitation.dto';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { LicitationStatus, Prisma } from '@prisma/client';

@Injectable()
export class LicitationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filterDto: FilterLicitationDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      modality,
      category,
      assignedToId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.LicitationWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
          { organ: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(modality && { modality }),
      ...(category && { category }),
      ...(assignedToId && { assignedToId }),
      ...(startDate && { openingDate: { gte: new Date(startDate) } }),
      ...(endDate && {
        openingDate: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const orderBy: Prisma.LicitationOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [licitations, total] = await Promise.all([
      this.prisma.licitation.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          _count: {
            select: { documents: true, proposals: true, tasks: true },
          },
        },
      }),
      this.prisma.licitation.count({ where }),
    ]);

    return paginate(licitations, total, page, limit);
  }

  async findOne(id: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id, deletedAt: null },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        proposals: {
          orderBy: { createdAt: 'desc' },
        },
        contracts: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        tasks: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            assignedTo: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: {
          select: {
            documents: true,
            proposals: true,
            contracts: true,
            tasks: true,
          },
        },
      },
    });

    if (!licitation) throw new NotFoundException('Licitação não encontrada');
    return licitation;
  }

  async create(createDto: CreateLicitationDto, userId: string) {
    const existing = await this.prisma.licitation.findUnique({
      where: { number: createDto.number },
    });

    if (existing) {
      throw new ConflictException(`Licitação com número ${createDto.number} já existe`);
    }

    const licitation = await this.prisma.licitation.create({
      data: {
        ...createDto,
        estimatedValue: createDto.estimatedValue ? createDto.estimatedValue : undefined,
        openingDate: createDto.openingDate ? new Date(createDto.openingDate) : undefined,
        closingDate: createDto.closingDate ? new Date(createDto.closingDate) : undefined,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Create activity log
    await this.prisma.activity.create({
      data: {
        type: 'CREATED',
        description: `Licitação ${licitation.number} criada`,
        userId,
        entityId: licitation.id,
        entityType: 'LICITATION',
        licitationId: licitation.id,
      },
    });

    return licitation;
  }

  async update(id: string, updateDto: UpdateLicitationDto, userId: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!licitation) throw new NotFoundException('Licitação não encontrada');

    const oldStatus = licitation.status;

    const updated = await this.prisma.licitation.update({
      where: { id },
      data: {
        ...updateDto,
        estimatedValue: updateDto.estimatedValue ? updateDto.estimatedValue : undefined,
        finalValue: updateDto.finalValue ? updateDto.finalValue : undefined,
        openingDate: updateDto.openingDate ? new Date(updateDto.openingDate) : undefined,
        closingDate: updateDto.closingDate ? new Date(updateDto.closingDate) : undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Log status change
    if (updateDto.status && updateDto.status !== oldStatus) {
      await this.prisma.activity.create({
        data: {
          type: 'STATUS_CHANGED',
          description: `Status alterado de ${oldStatus} para ${updateDto.status}`,
          userId,
          entityId: id,
          entityType: 'LICITATION',
          licitationId: id,
          metadata: { from: oldStatus, to: updateDto.status },
        },
      });
    } else {
      await this.prisma.activity.create({
        data: {
          type: 'UPDATED',
          description: `Licitação atualizada`,
          userId,
          entityId: id,
          entityType: 'LICITATION',
          licitationId: id,
        },
      });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!licitation) throw new NotFoundException('Licitação não encontrada');

    await this.prisma.licitation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.prisma.activity.create({
      data: {
        type: 'DELETED',
        description: `Licitação ${licitation.number} removida`,
        userId,
        entityId: id,
        entityType: 'LICITATION',
      },
    });

    return { message: 'Licitação removida com sucesso' };
  }

  async getStatsByStatus() {
    const stats = await this.prisma.licitation.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
      _sum: { estimatedValue: true },
    });

    return stats.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalValue: s._sum.estimatedValue,
    }));
  }

  async getUpcoming(days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.licitation.findMany({
      where: {
        deletedAt: null,
        openingDate: { gte: now, lte: future },
        status: { in: [LicitationStatus.PROSPECTING, LicitationStatus.ANALYZING, LicitationStatus.IN_PROGRESS] },
      },
      orderBy: { openingDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
