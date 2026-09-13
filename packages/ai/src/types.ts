export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: string;
  slug: string;
  initialize(config: AIProviderConfig): Promise<void>;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<boolean>;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}
