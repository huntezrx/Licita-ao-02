import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';
import { CompaniesController } from './companies/companies.controller';
import { CompaniesService } from './companies/companies.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeadsController, ContactsController, CompaniesController],
  providers: [LeadsService, ContactsService, CompaniesService],
  exports: [LeadsService, ContactsService, CompaniesService],
})
export class CrmModule {}
