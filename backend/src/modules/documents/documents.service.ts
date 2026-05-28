import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { paginate, getPaginationParams } from '../../common/utils/pagination.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma, DocumentType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadDocumentParams {
  file: Express.Multer.File;
  type: DocumentType;
  uploadedById: string;
  licitationId?: string;
  contractId?: string;
  proposalId?: string;
  tags?: string[];
  expiresAt?: string;
}

@Injectable()
export class DocumentsService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION', 'sa-east-1'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET', 'licitacao-documents');
  }

  async findAll(paginationDto: PaginationDto & { licitationId?: string; type?: DocumentType }) {
    const { page = 1, limit = 20, search, licitationId, type } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.DocumentWhereInput = {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(licitationId && { licitationId }),
      ...(type && { type }),
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return paginate(documents, total, page, limit);
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    return doc;
  }

  async upload(params: UploadDocumentParams) {
    const { file, type, uploadedById, licitationId, contractId, proposalId, tags, expiresAt } = params;

    if (!file) throw new BadRequestException('Arquivo não fornecido');

    const fileId = uuidv4();
    const fileExt = file.originalname.split('.').pop();
    const s3Key = `documents/${type.toLowerCase()}/${fileId}.${fileExt}`;

    // Upload to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: uploadedById,
        },
      }),
    );

    const url = `https://${this.bucket}.s3.${this.configService.get('AWS_REGION', 'sa-east-1')}.amazonaws.com/${s3Key}`;

    const document = await this.prisma.document.create({
      data: {
        name: file.originalname.replace(/\.[^.]+$/, ''),
        originalName: file.originalname,
        type,
        url,
        s3Key,
        size: file.size,
        mimeType: file.mimetype,
        uploadedById,
        licitationId,
        contractId,
        proposalId,
        tags: tags || [],
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    return document;
  }

  async getSignedUrl(id: string, expiresInSeconds = 3600) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento não encontrado');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: doc.s3Key,
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });

    return { url: signedUrl, expiresIn: expiresInSeconds };
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento não encontrado');

    // Delete from S3
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: doc.s3Key,
      }),
    );

    await this.prisma.document.delete({ where: { id } });
    return { message: 'Documento removido com sucesso' };
  }
}
