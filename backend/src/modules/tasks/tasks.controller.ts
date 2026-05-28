import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService, CreateTaskDto } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  findAll(@Query() query: Record<string, string>) {
    return this.tasksService.findAll({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      status: query.status as never,
      priority: query.priority as never,
      assignedToId: query.assignedToId,
      licitationId: query.licitationId,
    });
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Minhas tarefas' })
  getMyTasks(@CurrentUser() user: JwtPayload) {
    return this.tasksService.getMyTasks(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tarefa por ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTaskDto>) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover tarefa' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
