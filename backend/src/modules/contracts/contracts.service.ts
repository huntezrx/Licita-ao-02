import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.ContractWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          licitation: { select: { id: true, number: true, title: true } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return paginate(contracts, total, page, limit);
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id, deletedAt: null },
      include: {
        licitation: true,
        documents: true,
        financials: { orderBy: { date: 'desc' } },
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!contract) throw new NotFoundException('Contrato não encontrado');
    return contract;
  }

  async create(dto: CreateContractDto) {
    const existing = await this.prisma.contract.findUnique({
      where: { number: dto.number },
    });

    if (existing) {
      throw new ConflictException(`Contrato ${dto.number} já existe`);
    }

    return this.prisma.contract.create({
      data: {
        ...dto,
        value: dto.value,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async update(id: string, dto: UpdateContractDto) {
    const contract = await this.prisma.contract.findUnique({ where: { id, deletedAt: null } });
    if (!contract) throw new NotFoundException('Contrato não encontrado');

    return this.prisma.contract.update({
      where: { id },
      data: {
        ...dto,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id, deletedAt: null } });
    if (!contract) throw new NotFoundException('Contrato não encontrado');

    await this.prisma.contract.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Contrato removido com sucesso' };
  }

  async getExpiringContracts(days = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.contract.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        endDate: { gte: now, lte: future },
      },
      orderBy: { endDate: 'asc' },
    });
  }
}
