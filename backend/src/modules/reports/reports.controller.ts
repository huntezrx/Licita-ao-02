import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('licitations')
  @ApiOperation({ summary: 'Relatório de licitações' })
  getLicitationsReport(@Query() query: Record<string, string>) {
    return this.reportsService.getLicitationsReport({
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status as never,
      modality: query.modality as never,
    });
  }

  @Get('financial')
  @ApiOperation({ summary: 'Relatório financeiro' })
  getFinancialReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getFinancialReport({ startDate, endDate });
  }

  @Get('performance')
  @ApiOperation({ summary: 'Relatório de performance' })
  getPerformanceReport() {
    return this.reportsService.getPerformanceReport();
  }
}
