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
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('contracts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contractsService.findAll(paginationDto);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Contratos próximos do vencimento' })
  getExpiring(@Query('days') days: number) {
    return this.contractsService.getExpiringContracts(days || 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contrato por ID' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  create(@Body() createDto: CreateContractDto) {
    return this.contractsService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  update(@Param('id') id: string, @Body() updateDto: UpdateContractDto) {
    return this.contractsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover contrato' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
