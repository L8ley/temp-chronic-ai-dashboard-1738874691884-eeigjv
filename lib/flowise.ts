const FLOWISE_API_URL = process.env.NEXT_PUBLIC_FLOWISE_API_URL;
const FLOWISE_API_KEY = process.env.NEXT_PUBLIC_FLOWISE_API_KEY;

import { FlowiseClient } from 'flowise-sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FlowiseResponse {
  text: string;
  question: string;
  json?: any;
  chatId?: string;
  chatMessageId?: string;
  sessionId?: string;
  memoryType?: string;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, any>;
  }>;
  usedTools?: Array<{
    tool: string;
    toolInput: Record<string, any>;
    toolOutput: string;
  }>;
  fileAnnotations?: Array<{
    filePath: string;
    fileName: string;
  }>;
}

interface StreamingFlowiseResponse extends FlowiseResponse {
  isPartial?: boolean;
  event?: 'start' | 'token' | 'error' | 'end' | 'metadata' | 'sourceDocuments' | 'usedTools';
  data?: string;
}

export class FlowiseService {
  private readonly client: FlowiseClient;

  constructor() {
    if (!FLOWISE_API_URL) {
      throw new Error('Invalid or missing FLOWISE_API_URL');
    }
    if (!FLOWISE_API_KEY || typeof FLOWISE_API_KEY !== 'string' || FLOWISE_API_KEY.length < 32) {
      throw new Error('Invalid or missing FLOWISE_API_KEY');
    }

    const baseUrl = FLOWISE_API_URL.replace(/\/api\/v1\/?$/, '');
    this.client = new FlowiseClient({
      baseUrl,
      apiKey: `Bearer ${FLOWISE_API_KEY}`
    });
  }

  private validateChatflowId(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private validateMessages(messages: ChatMessage[]): void {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }
    
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        throw new Error('Invalid message content');
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        throw new Error('Invalid message role');
      }
    }
  }

  async chat(messages: ChatMessage[], chatflowId: string): Promise<FlowiseResponse> {
    try {
      this.validateMessages(messages);
      if (!this.validateChatflowId(chatflowId)) {
        throw new Error('Invalid chatflow ID format');
      }

      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'userMessage' : 'apiMessage',
        content: msg.content
      }));
      
      const response = await this.client.createPrediction({
        chatflowId,
        question: messages[messages.length - 1].content,
        history: history as any
      });

      return response as FlowiseResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Flowise API Error: ${error.message}`);
      }
      throw error;
    }
  }

  async chatStream(
    messages: ChatMessage[],
    chatflowId: string,
    onMessage: (response: StreamingFlowiseResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      this.validateMessages(messages);
      if (!this.validateChatflowId(chatflowId)) {
        throw new Error('Invalid chatflow ID format');
      }

      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'userMessage' : 'apiMessage',
        content: msg.content
      }));

      const prediction = await this.client.createPrediction({
        chatflowId,
        question: messages[messages.length - 1].content,
        history: history as any,
        streaming: true
      });

      let accumulatedText = '';
      let toolsUsed: Array<{
        tool: string;
        toolInput: Record<string, any>;
        toolOutput: string;
      }> | undefined;

      try {
        for await (const chunk of prediction) {
          if (chunk.event === 'error') {
            onError?.(new Error(chunk.data || 'Unknown streaming error'));
            continue;
          }

          if (chunk.event === 'token' && chunk.data) {
            accumulatedText += chunk.data;
            onMessage({
              text: accumulatedText,
              question: messages[messages.length - 1].content,
              isPartial: true,
              event: chunk.event,
              data: chunk.data,
              usedTools: toolsUsed
            });
          }

          if (chunk.event === 'usedTools' && chunk.data) {
            try {
              toolsUsed = typeof chunk.data === 'string' ? JSON.parse(chunk.data) : chunk.data;
              onMessage({
                text: accumulatedText,
                question: messages[messages.length - 1].content,
                isPartial: true,
                event: chunk.event,
                usedTools: toolsUsed
              });
            } catch (e) {
              console.error('Failed to parse tool usage data:', e);
            }
          }
        }

        onMessage({
          text: accumulatedText,
          question: messages[messages.length - 1].content,
          isPartial: false,
          usedTools: toolsUsed
        });

        onComplete?.();
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error);
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(new Error(`Flowise API Error: ${error.message}`));
      }
      throw error;
    }
  }
}

export const flowiseService = new FlowiseService(); 