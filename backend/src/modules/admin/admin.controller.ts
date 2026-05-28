import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('system-stats')
  @ApiOperation({ summary: 'Estatísticas do sistema' })
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Logs de auditoria' })
  getAuditLogs(@Query() query: Record<string, string>) {
    return this.adminService.getAuditLogs({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      userId: query.userId,
      resource: query.resource,
    });
  }

  @Get('users-stats')
  @ApiOperation({ summary: 'Usuários com estatísticas' })
  getUsersWithStats() {
    return this.adminService.getUsersWithStats();
  }
}
