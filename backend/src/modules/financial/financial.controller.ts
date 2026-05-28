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
import { FinancialService, CreateFinancialDto } from './financial.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('financial')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros financeiros' })
  findAll(@Query() query: Record<string, string>) {
    return this.financialService.findAll({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      type: query.type as never,
      status: query.status as never,
      licitationId: query.licitationId,
      contractId: query.contractId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro' })
  getSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.financialService.getSummary(startDate, endDate);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Fluxo de caixa mensal' })
  getCashFlow(@Query('months') months: number) {
    return this.financialService.getCashFlow(months || 6);
  }

  @Post()
  @ApiOperation({ summary: 'Criar registro financeiro' })
  create(@Body() dto: CreateFinancialDto) {
    return this.financialService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro financeiro' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateFinancialDto>) {
    return this.financialService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover registro financeiro' })
  remove(@Param('id') id: string) {
    return this.financialService.remove(id);
  }
}
