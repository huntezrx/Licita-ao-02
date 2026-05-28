import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrawlerService } from './crawler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CrawlerSource } from '@prisma/client';

@ApiTags('crawler')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('jobs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar jobs de crawler' })
  getJobs(@Query() query: Record<string, string>) {
    return this.crawlerService.getJobs({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      source: query.source as CrawlerSource,
    });
  }

  @Post('trigger/pncp')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Iniciar crawl do PNCP' })
  triggerPNCP() {
    return this.crawlerService.triggerCrawl(CrawlerSource.PNCP);
  }

  @Post('trigger/comprasnet')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Iniciar crawl do ComprasNet' })
  triggerComprasnet() {
    return this.crawlerService.triggerCrawl(CrawlerSource.COMPRASNET);
  }
}
