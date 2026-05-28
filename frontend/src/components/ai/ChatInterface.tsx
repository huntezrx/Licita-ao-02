'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { ChatMessage } from '@/types/ai.types';
import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function MessageBubble({ message }: { message: ChatMessage & { id?: string; timestamp?: string } }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copiado para a área de transferência');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-violet-500'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div
        className={cn(
          'relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className={cn('text-xs mt-1', isUser ? 'text-blue-200' : 'text-slate-500')}>
            {message.timestamp}
          </p>
        )}
        {!isUser && (
          <button
            onClick={copyToClipboard}
            className="absolute -bottom-2 -right-2 p-1 bg-slate-700 border border-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface ChatInterfaceProps {
  licitationId?: string;
  placeholder?: string;
}

export function ChatInterface({ licitationId, placeholder }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<ChatMessage & { id: string; timestamp: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou seu assistente especializado em licitações públicas brasileiras. Posso ajudá-lo com análise de editais, riscos jurídicos, elaboração de propostas, e muito mais. Como posso ajudar?',
      timestamp: formatDateTime(new Date()),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [
    'Quais os principais riscos desta licitação?',
    'Explique a modalidade Pregão Eletrônico',
    'Quais documentos são necessários para habilitação?',
    'Como elaborar uma proposta competitiva?',
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: content.trim(),
      timestamp: formatDateTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await aiService.chat(content.trim(), history, licitationId);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.response,
        timestamp: formatDateTime(new Date()),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error('Erro ao processar sua mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Assistente IA</h3>
          <p className="text-xs text-slate-400">Especialista em licitações públicas</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-sm text-slate-400">Analisando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-500 mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-end gap-3 bg-slate-800 rounded-xl border border-slate-700 px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={placeholder || 'Pergunte sobre licitações, editais, contratos...'}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none resize-none leading-relaxed max-h-32"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-center">
          Enter para enviar • Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
