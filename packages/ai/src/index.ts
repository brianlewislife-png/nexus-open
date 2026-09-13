import {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIMessage,
} from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { MistralProvider } from './providers/mistral';
import { OllamaProvider } from './providers/ollama';

export const providers = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  mistral: MistralProvider,
  ollama: OllamaProvider,
} as const;

export type ProviderSlug = keyof typeof providers;

export function createProvider(
  slug: string,
  config: AIProviderConfig
): Promise<AIProvider> {
  const ProviderClass = providers[slug as ProviderSlug];

  if (!ProviderClass) {
    throw new Error(
      `Unknown AI provider: "${slug}". Available providers: ${Object.keys(
        providers
      ).join(', ')}`
    );
  }

  const provider = new ProviderClass();
  return provider.initialize(config).then(() => provider);
}

export {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIMessage,
} from './types';
export { OpenAIProvider } from './providers/openai';
export { GeminiProvider } from './providers/gemini';
export { MistralProvider } from './providers/mistral';
export { OllamaProvider } from './providers/ollama';
export { BaseAIProvider } from './providers/base';
