import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChatDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licitationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{ role: string; content: string }>;
}

class GenerateProposalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize/:licitationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resumir licitação com IA' })
  summarize(
    @Param('licitationId') licitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.summarizeLicitation(licitationId, user.sub);
  }

  @Post('analyze-risks/:licitationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analisar riscos da licitação' })
  analyzeRisks(
    @Param('licitationId') licitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.analyzeRisks(licitationId, user.sub);
  }

  @Post('generate-proposal/:licitationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar proposta com IA' })
  generateProposal(
    @Param('licitationId') licitationId: string,
    @Body() dto: GenerateProposalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateProposal(licitationId, user.sub, dto.additionalContext);
  }

  @Post('extract-requirements/:licitationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Extrair requisitos da licitação' })
  extractRequirements(
    @Param('licitationId') licitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.extractRequirements(licitationId, user.sub);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat com assistente de licitações' })
  chat(@Body() dto: ChatDto, @CurrentUser() user: JwtPayload) {
    return this.aiService.chat(
      dto.message,
      user.sub,
      dto.conversationHistory,
      dto.licitationId,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de interações com IA' })
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('type') type: string,
  ) {
    return this.aiService.getHistory(user.sub, {
      page,
      limit,
      type: type as never,
    });
  }
}
