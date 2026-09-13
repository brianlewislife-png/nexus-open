import { Mistral } from '@mistralai/mistralai';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '@mistralai/mistralai/models/components';
import { BaseAIProvider } from './base';
import {
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

export class MistralProvider extends BaseAIProvider {
  readonly name = 'Mistral';
  readonly slug = 'mistral';

  private client: Mistral | null = null;

  async initialize(config: AIProviderConfig): Promise<void> {
    await super.initialize(config);

    const apiKey = this.getApiKey('MISTRAL_API_KEY');

    if (!apiKey) {
      throw new Error(
        'Mistral API key is required. Set MISTRAL_API_KEY environment variable or pass apiKey in config.'
      );
    }

    const clientOpts: Record<string, unknown> = { apiKey };

    if (this.config?.baseUrl) {
      clientOpts.serverURL = this.config.baseUrl;
    }

    this.client = new Mistral(clientOpts);
  }

  private requireClient(): Mistral {
    if (!this.client) {
      throw new Error('Mistral provider has not been initialized.');
    }
    return this.client;
  }

  private buildRequest(request: AICompletionRequest): ChatCompletionRequest {
    const completeRequest: ChatCompletionRequest = {
      model: this.resolveModel('mistral-small-latest'),
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: request.stream ?? false,
    };

    if (this.resolveTemperature(request) !== undefined) {
      completeRequest.temperature = this.resolveTemperature(request);
    }

    if (this.resolveMaxTokens(request) !== undefined) {
      completeRequest.maxTokens = this.resolveMaxTokens(request);
    }

    return completeRequest;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const client = this.requireClient();
    const completeRequest = this.buildRequest(request);

    try {
      if (completeRequest.stream) {
        const eventStream = await client.chat.stream(completeRequest);
        let content = '';
        let lastModel = '';

        for await (const event of eventStream) {
          const chunk = event?.data;
          if (!chunk) continue;

          lastModel = chunk.model || lastModel;

          for (const choice of chunk.choices ?? []) {
            const delta = choice?.delta?.content;
            if (typeof delta === 'string') {
              content += delta;
            } else if (Array.isArray(delta)) {
              for (const part of delta) {
                const text = (part as { text?: string }).text;
                if (text) {
                  content += text;
                }
              }
            }
          }
        }

        return {
          content,
          model: lastModel || (completeRequest.model as string),
          provider: this.slug,
        };
      }

      const response = await client.chat.complete(completeRequest);
      const messageContent = response.choices?.[0]?.message?.content ?? '';

      return {
        content:
          typeof messageContent === 'string'
            ? messageContent
            : messageContent.map((p) => (p as { text?: string }).text ?? '').join(''),
        model: response.model,
        provider: this.slug,
        usage: response.usage
          ? {
              promptTokens: response.usage.promptTokens ?? 0,
              completionTokens: response.usage.completionTokens ?? 0,
              totalTokens: response.usage.totalTokens ?? 0,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(
        `Mistral completion failed: ${error?.message ?? String(error)}`
      );
    }
  }

  async listModels(): Promise<string[]> {
    const client = this.requireClient();

    try {
      const response = await client.models.list();
      return (response.data ?? [])
        .map((m) => 'id' in m ? m.id : '')
        .filter(Boolean);
    } catch (error: any) {
      throw new Error(
        `Mistral list models failed: ${error?.message ?? String(error)}`
      );
    }
  }
}