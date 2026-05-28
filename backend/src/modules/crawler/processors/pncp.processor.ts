import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CrawlerService } from '../crawler.service';

@Processor('crawler')
export class CrawlerProcessor {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  @Process('crawl-pncp')
  async handlePNCPCrawl(job: Job<{ jobId: string; source: string }>) {
    this.logger.log(`Processing PNCP crawl job: ${job.data.jobId}`);
    try {
      const result = await this.crawlerService.crawlPNCP(job.data.jobId);
      this.logger.log(`PNCP crawl completed: ${result.itemsFound} found, ${result.itemsCreated} created`);
      return result;
    } catch (error) {
      this.logger.error(`PNCP crawl failed: ${(error as Error).message}`);
      throw error;
    }
  }

  @Process('crawl-comprasnet')
  async handleComprasnetCrawl(job: Job<{ jobId: string; source: string }>) {
    this.logger.log(`Processing ComprasNet crawl job: ${job.data.jobId}`);
    try {
      const result = await this.crawlerService.crawlComprasnet(job.data.jobId);
      this.logger.log(`ComprasNet crawl completed: ${result.itemsFound} found, ${result.itemsCreated} created`);
      return result;
    } catch (error) {
      this.logger.error(`ComprasNet crawl failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
