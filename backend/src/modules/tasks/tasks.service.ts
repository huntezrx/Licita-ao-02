import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licitationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    licitationId?: string;
  }) {
    const { page = 1, limit = 20, status, priority, assignedToId, licitationId } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.TaskWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedToId }),
      ...(licitationId && { licitationId }),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          licitation: { select: { id: true, number: true, title: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return paginate(tasks, total, page, limit);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        licitation: { select: { id: true, number: true, title: true } },
        lead: { select: { id: true, name: true } },
      },
    });

    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        tags: dto.tags || [],
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async update(id: string, dto: Partial<CreateTaskDto> & { status?: TaskStatus }) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const completedAt = dto.status === TaskStatus.DONE ? new Date() : undefined;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ...(completedAt && { completedAt }),
      },
    });
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Tarefa removida com sucesso' };
  }

  async getMyTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assignedToId: userId,
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      include: {
        licitation: { select: { id: true, number: true, title: true } },
      },
      take: 20,
    });
  }
}
