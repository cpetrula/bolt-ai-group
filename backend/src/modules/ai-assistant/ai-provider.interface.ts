/**
 * AI Provider Interface
 * Defines the contract for pluggable AI implementations
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities?: Record<string, any>;
}

/**
 * Base interface for AI providers
 */
export interface AIProvider {
  /**
   * Generate a text completion from messages
   */
  generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult>;

  /**
   * Detect intent from user input
   */
  detectIntent(userInput: string, context?: Record<string, any>): Promise<IntentResult>;

  /**
   * Extract entities from user input
   */
  extractEntities(userInput: string): Promise<Record<string, any>>;
}

/**
 * Interface for call orchestration providers (e.g., Vapi)
 */
export interface CallOrchestrationProvider {
  /**
   * Initialize a phone call
   */
  initiateCall(phoneNumber: string, options?: Record<string, any>): Promise<string>;

  /**
   * Handle incoming call webhook
   */
  handleIncomingCall(callData: any): Promise<void>;

  /**
   * End a call
   */
  endCall(callId: string): Promise<void>;

  /**
   * Get call status
   */
  getCallStatus(callId: string): Promise<any>;
}

/**
 * Interface for Text-to-Speech providers
 */
export interface TTSProvider {
  /**
   * Generate audio from text
   */
  synthesize(text: string, options?: Record<string, any>): Promise<Buffer>;

  /**
   * Get available voices
   */
  getVoices(): Promise<any[]>;
}
