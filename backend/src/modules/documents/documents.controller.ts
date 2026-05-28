import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DocumentType } from '@prisma/client';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos' })
  findAll(@Query() query: PaginationDto & { licitationId?: string; type?: DocumentType }) {
    return this.documentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter documento por ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Obter URL assinada para download' })
  getSignedUrl(@Param('id') id: string) {
    return this.documentsService.getSignedUrl(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de documento' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
    @Body('licitationId') licitationId: string,
    @Body('contractId') contractId: string,
    @Body('proposalId') proposalId: string,
    @Body('tags') tagsJson: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const tags = tagsJson ? JSON.parse(tagsJson) : [];
    return this.documentsService.upload({
      file,
      type: type || DocumentType.OTHER,
      uploadedById: user.sub,
      licitationId,
      contractId,
      proposalId,
      tags,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover documento' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
