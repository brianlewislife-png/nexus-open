import { BaseAIProvider } from './base';
import {
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

interface OllamaChatMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  model: string;
  message?: {
    role: string;
    content: string;
  };
  done?: boolean;
  response?: string;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaListModelsResponse {
  models?: Array<{
    name?: string;
    model?: string;
  }>;
}

interface OllamaHealthResponse {
  status?: string;
}

export class OllamaProvider extends BaseAIProvider {
  readonly name = 'Ollama';
  readonly slug = 'ollama';

  private baseUrl: string = 'http://localhost:11434';

  async initialize(config: AIProviderConfig): Promise<void> {
    await super.initialize(config);
    this.baseUrl =
      (this.config?.baseUrl?.trim() || process.env.OLLAMA_BASE_URL?.trim() || 'http://localhost:11434').replace(/\/+$/, '');
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = this.resolveModel('llama3.1');

    try {
      const messages: OllamaChatMessage[] = request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body: Record<string, unknown> = {
        model,
        messages,
        stream: false,
      };

      if (this.resolveTemperature(request) !== undefined) {
        body.options = {
          ...(body.options as object),
          temperature: this.resolveTemperature(request),
        };
      }

      if (this.resolveMaxTokens(request) !== undefined) {
        body.options = {
          ...(body.options as object),
          num_predict: this.resolveMaxTokens(request),
        };
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as OllamaChatResponse;

      const content = data.message?.content ?? data.response ?? '';

      let usage: AICompletionResponse['usage'];
      if (data.prompt_eval_count !== undefined && data.eval_count !== undefined) {
        usage = {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          totalTokens: data.prompt_eval_count + data.eval_count,
        };
      }

      return {
        content,
        model: data.model ?? model,
        provider: this.slug,
        usage,
      };
    } catch (error: any) {
      throw new Error(
        `Ollama completion failed: ${error?.message ?? String(error)}`
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as OllamaListModelsResponse;
      return (data.models ?? []).map((m) => m.name ?? m.model ?? '');
    } catch (error: any) {
      throw new Error(
        `Ollama list models failed: ${error?.message ?? String(error)}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const data = (await response.json()) as OllamaHealthResponse;
        return data.status === 'ok';
      }

      return true;
    } catch {
      return false;
    }
  }
}
