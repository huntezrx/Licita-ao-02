import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import { CrawlerSource, CrawlerStatus } from '@prisma/client';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('crawler') private crawlerQueue: Queue,
  ) {}

  @Cron('0 */6 * * *') // Every 6 hours
  async scheduledCrawl() {
    this.logger.log('Starting scheduled crawl...');
    await this.triggerCrawl(CrawlerSource.PNCP);
    await this.triggerCrawl(CrawlerSource.COMPRASNET);
  }

  async triggerCrawl(source: CrawlerSource) {
    const job = await this.prisma.crawlerJob.create({
      data: { source, status: CrawlerStatus.PENDING },
    });

    await this.crawlerQueue.add(
      source === CrawlerSource.PNCP ? 'crawl-pncp' : 'crawl-comprasnet',
      { jobId: job.id, source },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: false,
      },
    );

    return job;
  }

  async getJobs(params: { page?: number; limit?: number; source?: CrawlerSource }) {
    const { page = 1, limit = 20, source } = params;
    const skip = (page - 1) * limit;

    const where = { ...(source && { source }) };

    const [jobs, total] = await Promise.all([
      this.prisma.crawlerJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.crawlerJob.count({ where }),
    ]);

    return {
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async crawlPNCP(jobId: string) {
    const apiUrl = this.configService.get('PNCP_API_URL', 'https://pncp.gov.br/api/pncp/v1');

    await this.prisma.crawlerJob.update({
      where: { id: jobId },
      data: { status: CrawlerStatus.RUNNING, startedAt: new Date() },
    });

    let itemsFound = 0;
    let itemsCreated = 0;

    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

      const response = await axios.get(`${apiUrl}/contratacoes/publicacao`, {
        params: {
          dataInicial: today,
          dataFinal: today,
          pagina: 1,
          tamanhoPagina: 50,
        },
        timeout: 30000,
      });

      const items = response.data?.data || [];
      itemsFound = items.length;

      for (const item of items) {
        try {
          const existing = await this.prisma.notice.findFirst({
            where: { pncpId: item.numeroControlePNCP } as never,
          });

          if (!existing) {
            await this.prisma.notice.create({
              data: {
                title: item.objetoCompra || 'Sem título',
                organ: item.orgaoEntidade?.razaoSocial || 'Não informado',
                number: item.numeroCompra,
                value: item.valorTotalEstimado || null,
                modality: item.modalidadeNome,
                status: 'PENDING',
                source: CrawlerSource.PNCP,
                rawContent: JSON.stringify(item),
                sourceUrl: `https://pncp.gov.br/app/editais/${item.numeroControlePNCP}`,
                publishedAt: item.dataPublicacaoPncp ? new Date(item.dataPublicacaoPncp) : undefined,
              } as never,
            });
            itemsCreated++;
          }
        } catch (itemError) {
          this.logger.error(`Error processing PNCP item: ${(itemError as Error).message}`);
        }
      }

      await this.prisma.crawlerJob.update({
        where: { id: jobId },
        data: {
          status: CrawlerStatus.COMPLETED,
          completedAt: new Date(),
          itemsFound,
          itemsCreated,
        },
      });
    } catch (error) {
      await this.prisma.crawlerJob.update({
        where: { id: jobId },
        data: {
          status: CrawlerStatus.FAILED,
          completedAt: new Date(),
          errors: { message: (error as Error).message },
        },
      });
      throw error;
    }

    return { itemsFound, itemsCreated };
  }

  async crawlComprasnet(jobId: string) {
    await this.prisma.crawlerJob.update({
      where: { id: jobId },
      data: { status: CrawlerStatus.RUNNING, startedAt: new Date() },
    });

    // ComprasNet crawler implementation
    // In production, implement actual API calls to ComprasNet
    await this.prisma.crawlerJob.update({
      where: { id: jobId },
      data: {
        status: CrawlerStatus.COMPLETED,
        completedAt: new Date(),
        itemsFound: 0,
        itemsCreated: 0,
        metadata: { note: 'ComprasNet integration pending API access' },
      },
    });

    return { itemsFound: 0, itemsCreated: 0 };
  }
}
