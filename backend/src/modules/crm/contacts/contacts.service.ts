import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../../common/utils/pagination.util';
import { Prisma } from '@prisma/client';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateContactDto {
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
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];
}

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page?: number; limit?: number; search?: string; companyId?: string }) {
    const { page = 1, limit = 20, search, companyId } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.ContactWhereInput = {
      ...(companyId && { companyId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { company: { select: { id: true, name: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return paginate(contacts, total, page, limit);
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    return contact;
  }

  async create(dto: CreateContactDto) {
    return this.prisma.contact.create({ data: { ...dto, tags: dto.tags || [] } });
  }

  async update(id: string, dto: Partial<CreateContactDto>) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contato removido com sucesso' };
  }
}
