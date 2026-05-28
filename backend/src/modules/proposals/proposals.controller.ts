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
import { ProposalsService, CreateProposalDto } from './proposals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('proposals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar propostas' })
  findAll(@Query() query: PaginationDto & { licitationId?: string }) {
    return this.proposalsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter proposta por ID' })
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar proposta' })
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar proposta' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateProposalDto>) {
    return this.proposalsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover proposta' })
  remove(@Param('id') id: string) {
    return this.proposalsService.remove(id);
  }
}
