import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ProposalStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProposalDto {
  @ApiProperty()
  @IsString()
  licitationId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ enum: ProposalStatus })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto & { licitationId?: string }) {
    const { page = 1, limit = 20, search, licitationId } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.ProposalWhereInput = {
      ...(licitationId && { licitationId }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' },
      }),
    };

    const [proposals, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          licitation: { select: { id: true, number: true, title: true } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return paginate(proposals, total, page, limit);
  }

  async findOne(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        licitation: true,
        documents: true,
      },
    });

    if (!proposal) throw new NotFoundException('Proposta não encontrada');
    return proposal;
  }

  async create(dto: CreateProposalDto) {
    return this.prisma.proposal.create({
      data: {
        ...dto,
        value: dto.value,
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : undefined,
      },
    });
  }

  async update(id: string, dto: Partial<CreateProposalDto>) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposta não encontrada');

    return this.prisma.proposal.update({
      where: { id },
      data: {
        ...dto,
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposta não encontrada');

    await this.prisma.proposal.delete({ where: { id } });
    return { message: 'Proposta removida com sucesso' };
  }
}
