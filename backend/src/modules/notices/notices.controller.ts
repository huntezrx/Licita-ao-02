import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService, FilterNoticeDto } from './notices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoticeStatus } from '@prisma/client';

@ApiTags('notices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar editais' })
  findAll(@Query() filterDto: FilterNoticeDto) {
    return this.noticesService.findAll(filterDto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Editais recentes' })
  getRecent() {
    return this.noticesService.getRecentNotices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter edital por ID' })
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do edital' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: NoticeStatus,
  ) {
    return this.noticesService.updateStatus(id, status);
  }
}
