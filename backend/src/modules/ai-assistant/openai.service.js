const { AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  IntentResult, } = require('./ai-provider.interface');
const { env } = require('../../config/env');
const { logger } = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * OpenAI Service Implementation
 * Provides LLM and NLU capabilities using OpenAI's API
 */
class OpenAIService {
  constructor() {
    this.apiKey = env.openaiApiKey || '';
    this.baseUrl = 'https://api.openai.com/v1';
    if (!this.apiKey) {
      logger.warn('OpenAI API key not configured');
    }
  }

  /**
   * Generate a completion using OpenAI's chat API
   */
  async generateCompletion(
    messages,
    options
  ) {
    if (!this.apiKey) {
      throw new AppError('OpenAI API key not configured', 500);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'gpt-4o-mini',
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OpenAI API error:', errorText);
        throw new AppError(`OpenAI API error: ${errorText || response.statusText}`, response.status);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      logger.error('Error generating OpenAI completion:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to generate AI completion', 500);
    }
  }

  /**
   * Detect intent from user input using OpenAI
   */
  async detectIntent(
    userInput,
    context
  ) {
    const systemPrompt = `You are an intent detection system for a salon booking assistant. 
Analyze the user's input and return ONLY a JSON object with the following structure:
{
  "intent": "one of, book_appointment, modify_appointment, cancel_appointment, ask_hours, ask_services, ask_pricing, other",
  "confidence": 0.0-1.0,
  "entities": {
    "service": "service name if mentioned",
    "date": "date if mentioned (ISO format)",
    "time": "time if mentioned (HH)",
    "employeeName": "employee name if mentioned"
  }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `User input: "${userInput}"\nContext: ${JSON.stringify(context || {})}`,
      },
    ];

    try {
      const result = await this.generateCompletion(messages, {
        temperature: 0.3,
        maxTokens,
      });

      const parsed = JSON.parse(result.content);
      return {
        intent: parsed.intent || 'other',
        confidence: parsed.confidence || 0.5,
        entities: parsed.entities || {},
      };
    } catch (error) {
      logger.error('Error detecting intent:', error);
      return {
        intent: 'other',
        confidence: 0.0,
        entities: {},
      };
    }
  }

  /**
   * Extract entities from user input
   */
  async extractEntities(userInput) {
    const systemPrompt = `You are an entity extraction system for a salon booking assistant.
Extract relevant entities from the user's input and return ONLY a JSON object with extracted values.
Possible entities, date, time, employeeName, customerName, phoneNumber, email.
Return empty object if no entities found.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ];

    try {
      const result = await this.generateCompletion(messages, {
        temperature: 0.3,
        maxTokens,
      });

      return JSON.parse(result.content);
    } catch (error) {
      logger.error('Error extracting entities:', error);
      return {};
    }
  }
}

// Export singleton instance
const openaiService = new OpenAIService();

module.exports = { openaiService };
