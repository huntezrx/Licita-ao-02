import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import OpenAI from 'openai';
import { AIHistoryType } from '@prisma/client';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set. AI features will be limited.');
    }
    this.openai = new OpenAI({ apiKey: apiKey || 'placeholder' });
  }

  async summarizeLicitation(licitationId: string, userId: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id: licitationId },
      include: { documents: { take: 3 } },
    });

    if (!licitation) throw new BadRequestException('Licitação não encontrada');

    const prompt = `Analise e faça um resumo executivo desta licitação:

Número: ${licitation.number}
Título: ${licitation.title}
Órgão: ${licitation.organ}
Modalidade: ${licitation.modality}
Status: ${licitation.status}
Valor Estimado: R$ ${licitation.estimatedValue || 'Não informado'}
Data de Abertura: ${licitation.openingDate || 'Não informada'}
Data de Encerramento: ${licitation.closingDate || 'Não informada'}
Descrição: ${licitation.description || 'Sem descrição'}

Por favor, forneça:
1. Resumo executivo (3-4 parágrafos)
2. Objeto principal da licitação
3. Prazo e valor
4. Recomendação inicial de participação`;

    return this.callOpenAI(
      prompt,
      AIHistoryType.SUMMARIZE,
      userId,
      licitationId,
    );
  }

  async analyzeRisks(licitationId: string, userId: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id: licitationId },
    });

    if (!licitation) throw new BadRequestException('Licitação não encontrada');

    const prompt = `Analise os riscos desta licitação:

Número: ${licitation.number}
Título: ${licitation.title}
Órgão: ${licitation.organ}
Modalidade: ${licitation.modality}
Valor Estimado: R$ ${licitation.estimatedValue || 'Não informado'}
Descrição: ${licitation.description || 'Sem descrição'}

Forneça uma análise detalhada de:
1. Riscos técnicos (probabilidade e impacto)
2. Riscos financeiros
3. Riscos jurídicos/regulatórios
4. Riscos operacionais
5. Recomendações de mitigação para cada risco
6. Pontuação geral de risco (1-10)`;

    return this.callOpenAI(
      prompt,
      AIHistoryType.ANALYZE_RISKS,
      userId,
      licitationId,
    );
  }

  async generateProposal(licitationId: string, userId: string, additionalContext?: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id: licitationId },
    });

    if (!licitation) throw new BadRequestException('Licitação não encontrada');

    const prompt = `Gere uma proposta comercial estruturada para esta licitação:

Número: ${licitation.number}
Título: ${licitation.title}
Órgão: ${licitation.organ}
Modalidade: ${licitation.modality}
Valor Estimado: R$ ${licitation.estimatedValue || 'Não informado'}
Descrição: ${licitation.description || 'Sem descrição'}
${additionalContext ? `Contexto adicional: ${additionalContext}` : ''}

Inclua:
1. Carta de apresentação
2. Entendimento do objeto
3. Metodologia proposta
4. Equipe técnica sugerida
5. Cronograma de execução
6. Proposta de preços (estrutura sugerida)
7. Diferenciais competitivos`;

    return this.callOpenAI(
      prompt,
      AIHistoryType.GENERATE_PROPOSAL,
      userId,
      licitationId,
    );
  }

  async extractRequirements(licitationId: string, userId: string) {
    const licitation = await this.prisma.licitation.findUnique({
      where: { id: licitationId },
    });

    if (!licitation) throw new BadRequestException('Licitação não encontrada');

    const prompt = `Extraia e liste todos os requisitos desta licitação de forma estruturada:

Número: ${licitation.number}
Título: ${licitation.title}
Descrição: ${licitation.description || 'Sem descrição'}

Identifique e categorize:
1. Requisitos técnicos obrigatórios
2. Requisitos de habilitação jurídica
3. Requisitos de qualificação técnica
4. Requisitos de qualificação econômico-financeira
5. Documentos necessários para habilitação
6. Requisitos específicos do objeto
7. Prazos importantes`;

    return this.callOpenAI(
      prompt,
      AIHistoryType.EXTRACT_REQUIREMENTS,
      userId,
      licitationId,
    );
  }

  async chat(message: string, userId: string, conversationHistory?: Array<{ role: string; content: string }>, licitationId?: string) {
    const systemPrompt = `Você é um assistente especializado em licitações públicas brasileiras.
Você tem profundo conhecimento em:
- Lei 8.666/93 e Lei 14.133/21 (Nova Lei de Licitações)
- Pregão Eletrônico (Lei 10.520/02)
- PNCP (Portal Nacional de Contratações Públicas)
- ComprasNet
- Análise de editais e contratos
- Propostas comerciais para licitações
- Compliance e ética em licitações

Responda sempre em português brasileiro, de forma profissional e detalhada.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map(
        (h) =>
          ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          }),
      ),
      { role: 'user', content: message },
    ];

    return this.callOpenAI(
      message,
      AIHistoryType.CHAT,
      userId,
      licitationId,
      messages,
    );
  }

  private async callOpenAI(
    prompt: string,
    type: AIHistoryType,
    userId: string,
    licitationId?: string,
    messages?: OpenAI.Chat.ChatCompletionMessageParam[],
  ) {
    if (!this.configService.get('OPENAI_API_KEY')) {
      return {
        response: 'Funcionalidade de IA não configurada. Por favor, configure a chave da API do OpenAI.',
        tokens: 0,
        cost: 0,
      };
    }

    try {
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages || [
        {
          role: 'system',
          content:
            'Você é um assistente especializado em licitações públicas brasileiras. Responda sempre em português brasileiro.',
        },
        { role: 'user', content: prompt },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages: chatMessages,
        max_tokens: 4000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens || 0;
      const cost = (tokens / 1000) * 0.03; // Approximate cost

      // Save to history
      await this.prisma.aIHistory.create({
        data: {
          userId,
          type,
          prompt,
          response: content,
          tokens,
          cost,
          licitationId,
        },
      });

      return { response: content, tokens, cost };
    } catch (error) {
      const err = error as Error;
      throw new ServiceUnavailableException(
        `Erro ao chamar OpenAI: ${err.message}`,
      );
    }
  }

  async getHistory(userId: string, params: { page?: number; limit?: number; type?: AIHistoryType }) {
    const { page = 1, limit = 20, type } = params;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.aIHistory.findMany({
        where: {
          userId,
          ...(type && { type }),
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          licitation: { select: { id: true, number: true, title: true } },
        },
      }),
      this.prisma.aIHistory.count({ where: { userId, ...(type && { type }) } }),
    ]);

    return {
      data: history,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
