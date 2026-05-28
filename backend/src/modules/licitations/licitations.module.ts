import { Module } from '@nestjs/common';
import { LicitationsService } from './licitations.service';
import { LicitationsController } from './licitations.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicitationsController],
  providers: [LicitationsService],
  exports: [LicitationsService],
})
export class LicitationsModule {}
