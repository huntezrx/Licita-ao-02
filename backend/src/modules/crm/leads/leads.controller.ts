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
import { LeadsService, CreateLeadDto } from './leads.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('crm/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar leads' })
  findAll(@Query() query: Record<string, string>) {
    return this.leadsService.findAll({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      status: query.status as never,
      assignedToId: query.assignedToId,
      search: query.search,
    });
  }

  @Get('pipeline-stats')
  @ApiOperation({ summary: 'Estatísticas do pipeline' })
  getPipelineStats() {
    return this.leadsService.getPipelineStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter lead por ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar lead' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar lead' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateLeadDto>) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
