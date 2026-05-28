import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { NoticeStatus, Prisma } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterNoticeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: NoticeStatus })
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filterDto: FilterNoticeDto) {
    const { page = 1, limit = 20, search, status, source } = filterDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.NoticeWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { organ: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(source && { source: source as never }),
    };

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notice.count({ where }),
    ]);

    return paginate(notices, total, page, limit);
  }

  async findOne(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Edital não encontrado');
    return notice;
  }

  async updateStatus(id: string, status: NoticeStatus) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Edital não encontrado');

    return this.prisma.notice.update({
      where: { id },
      data: { status },
    });
  }

  async getRecentNotices(limit = 10) {
    return this.prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      where: { status: { not: NoticeStatus.REJECTED } },
    });
  }
}
