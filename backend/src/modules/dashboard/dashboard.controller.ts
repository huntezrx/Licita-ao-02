import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs principais do dashboard' })
  getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Atividades recentes' })
  getRecentActivities(@Query('limit') limit: number) {
    return this.dashboardService.getRecentActivities(limit || 20);
  }

  @Get('licitations-by-status')
  @ApiOperation({ summary: 'Licitações por status' })
  getLicitationsByStatus() {
    return this.dashboardService.getLicitationsByStatus();
  }

  @Get('upcoming-deadlines')
  @ApiOperation({ summary: 'Próximos prazos' })
  getUpcomingDeadlines() {
    return this.dashboardService.getUpcomingDeadlines();
  }

  @Get('financial-chart')
  @ApiOperation({ summary: 'Gráfico financeiro mensal' })
  getFinancialChart(@Query('months') months: number) {
    return this.dashboardService.getFinancialChart(months || 6);
  }
}
