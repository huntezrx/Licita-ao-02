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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LicitationsService } from './licitations.service';
import {
  CreateLicitationDto,
  UpdateLicitationDto,
  FilterLicitationDto,
} from './dto/create-licitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('licitations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('licitations')
export class LicitationsController {
  constructor(private readonly licitationsService: LicitationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar licitações com filtros' })
  findAll(@Query() filterDto: FilterLicitationDto) {
    return this.licitationsService.findAll(filterDto);
  }

  @Get('stats/status')
  @ApiOperation({ summary: 'Estatísticas por status' })
  getStatsByStatus() {
    return this.licitationsService.getStatsByStatus();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Licitações com prazo próximo' })
  getUpcoming(@Query('days') days: number) {
    return this.licitationsService.getUpcoming(days || 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter licitação por ID' })
  findOne(@Param('id') id: string) {
    return this.licitationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova licitação' })
  create(
    @Body() createDto: CreateLicitationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.licitationsService.create(createDto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar licitação' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLicitationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.licitationsService.update(id, updateDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover licitação' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.licitationsService.remove(id, user.sub);
  }
}
