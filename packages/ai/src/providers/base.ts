import {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly slug: string;

  protected config: AIProviderConfig | null = null;

  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = { ...config };
  }

  abstract complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  abstract listModels(): Promise<string[]>;

  async healthCheck(): Promise<boolean> {
    try {
      const models = await this.listModels();
      return Array.isArray(models) && models.length > 0;
    } catch {
      return false;
    }
  }

  protected requireConfig(): AIProviderConfig {
    if (!this.config) {
      throw new Error(
        `${this.name} provider has not been initialized. Call initialize() first.`
      );
    }
    return this.config;
  }

  protected getApiKey(envVar: string): string | undefined {
    if (this.config?.apiKey) {
      return this.config.apiKey;
    }
    return process.env[envVar] || undefined;
  }

  protected resolveModel(fallbackModel: string): string {
    if (this.config?.model && this.config.model.trim().length > 0) {
      return this.config.model;
    }
    return fallbackModel;
  }

  protected resolveTemperature(request: AICompletionRequest): number | undefined {
    return request.temperature ?? this.config?.temperature;
  }

  protected resolveMaxTokens(request: AICompletionRequest): number | undefined {
    return request.maxTokens ?? this.config?.maxTokens;
  }

  protected messagesToPrompt(messages: AICompletionRequest['messages']): string {
    return messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  }
}
