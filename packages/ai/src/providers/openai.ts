import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import {
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'OpenAI';
  readonly slug = 'openai';

  private client: OpenAI | null = null;

  async initialize(config: AIProviderConfig): Promise<void> {
    await super.initialize(config);

    const apiKey = this.getApiKey('OPENAI_API_KEY');
    const baseUrl = this.config?.baseUrl || undefined;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey in config.'
      );
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
  }

  private requireClient(): OpenAI {
    if (!this.client) {
      throw new Error('OpenAI provider has not been initialized.');
    }
    return this.client;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const client = this.requireClient();
    const model = this.resolveModel('gpt-4o-mini');

    try {
      const response = await client.chat.completions.create({
        model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        ...(this.resolveTemperature(request) !== undefined
          ? { temperature: this.resolveTemperature(request) }
          : {}),
        ...(this.resolveMaxTokens(request) !== undefined
          ? { max_tokens: this.resolveMaxTokens(request) }
          : {}),
      });

      const message = response.choices[0]?.message?.content ?? '';

      return {
        content: message,
        model: response.model,
        provider: this.slug,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(
        `OpenAI completion failed: ${error?.message ?? String(error)}`
      );
    }
  }

  async listModels(): Promise<string[]> {
    const client = this.requireClient();

    try {
      const models = await client.models.list();
      return models.data.map((m) => m.id);
    } catch (error: any) {
      throw new Error(
        `OpenAI list models failed: ${error?.message ?? String(error)}`
      );
    }
  }
}
