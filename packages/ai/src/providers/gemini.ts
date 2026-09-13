import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { BaseAIProvider } from './base';
import {
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

export class GeminiProvider extends BaseAIProvider {
  readonly name = 'Google Gemini';
  readonly slug = 'gemini';

  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private modelName: string | null = null;

  async initialize(config: AIProviderConfig): Promise<void> {
    await super.initialize(config);

    const apiKey = this.getApiKey('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error(
        'Gemini API key is required. Set GEMINI_API_KEY environment variable or pass apiKey in config.'
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = this.resolveModel('gemini-1.5-flash');
    this.model = this.client.getGenerativeModel({
      model: this.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
  }

  private requireModel(): GenerativeModel {
    if (!this.model) {
      throw new Error('Gemini provider has not been initialized.');
    }
    return this.model;
  }

  private async generateContentStream(
    model: GenerativeModel,
    request: AICompletionRequest
  ): Promise<string> {
    const parts = request.messages.map((m) => m.content);
    const prompt = parts.join('\n\n');

    const generationConfig = {
      ...(this.resolveTemperature(request) !== undefined
        ? { temperature: this.resolveTemperature(request) }
        : {}),
      ...(this.resolveMaxTokens(request) !== undefined
        ? { maxOutputTokens: this.resolveMaxTokens(request) }
        : {}),
    };

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    let content = '';
    for await (const chunk of result.stream) {
      content += chunk.text() ?? '';
    }

    return content;
  }

  private async generateContent(
    model: GenerativeModel,
    request: AICompletionRequest
  ): Promise<string> {
    const parts = request.messages.map((m) => m.content);
    const prompt = parts.join('\n\n');

    const generationConfig = {
      ...(this.resolveTemperature(request) !== undefined
        ? { temperature: this.resolveTemperature(request) }
        : {}),
      ...(this.resolveMaxTokens(request) !== undefined
        ? { maxOutputTokens: this.resolveMaxTokens(request) }
        : {}),
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    return result.response.text();
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = this.requireModel();
    const modelName = this.modelName ?? '';

    try {
      const content = request.stream
        ? await this.generateContentStream(model, request)
        : await this.generateContent(model, request);

      return {
        content,
        model: modelName,
        provider: this.slug,
      };
    } catch (error: any) {
      throw new Error(
        `Gemini completion failed: ${error?.message ?? String(error)}`
      );
    }
  }

  async listModels(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Gemini provider has not been initialized.');
    }

    try {
      const baseUrl =
        this.config?.baseUrl?.trim() || 'https://generativelanguage.googleapis.com';
      const apiKey = this.getApiKey('GEMINI_API_KEY');

      if (!apiKey) {
        throw new Error(
          'Gemini API key is required. Set GEMINI_API_KEY environment variable or pass apiKey in config.'
        );
      }

      const response = await fetch(
        `${baseUrl.replace(/\/+$/, '')}/v1beta/models?key=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as { models?: Array<{ name?: string }> };
      return (data.models ?? []).map((m) => m.name ?? '').filter(Boolean);
    } catch (error: any) {
      throw new Error(
        `Gemini list models failed: ${error?.message ?? String(error)}`
      );
    }
  }
}
