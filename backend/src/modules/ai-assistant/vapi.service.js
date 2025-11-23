const { CallOrchestrationProvider } = require('./ai-provider.interface');
const { env } = require('../../config/env');
const { logger } = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Vapi Service Implementation
 * Handles call orchestration using Vapi's API
 */
class VapiService {
  constructor() {
    this.apiKey = env.vapiApiKey || '';
    this.baseUrl = 'https://api.vapi.ai';
    this.assistantId = env.vapiAssistantId || '';
    if (!this.apiKey) {
      logger.warn('Vapi API key not configured');
    }
    if (!this.assistantId) {
      logger.warn('Vapi Assistant ID not configured');
    }
  }

  /**
   * Initiate an outbound call using Vapi
   */
  async initiateCall(
    phoneNumber,
    options?: Record<string, any>
  ) {
    if (!this.apiKey || !this.assistantId) {
      throw new AppError('Vapi not configured', 500);
    }

    try {
      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          assistantId: this.assistantId,
          customer: {
            number,
          },
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Vapi API error:', error);
        throw new AppError(`Vapi API error: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      logger.info(`Call initiated to ${phoneNumber}, ID: ${data.id}`);
      
      return data.id;
    } catch (error) {
      logger.error('Error initiating call:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to initiate call', 500);
    }
  }

  /**
   * Handle incoming call webhook from Vapi
   */
  async handleIncomingCall(callData) {
    try {
      logger.info('Incoming call received:', {
        callId: callData.id,
        from: callData.customer?.number,
        status: callData.status,
      });

      // Vapi handles the call automatically with the configured assistant
      // Store call data or trigger any necessary business logic here
      
    } catch (error) {
      logger.error('Error handling incoming call:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to handle incoming call', 500);
    }
  }

  /**
   * End an active call
   */
  async endCall(callId) {
    if (!this.apiKey) {
      throw new AppError('Vapi API key not configured', 500);
    }

    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Vapi API error ending call:', error);
        throw new AppError(`Failed to end call: ${response.statusText}`, response.status);
      }

      logger.info(`Call ${callId} ended successfully`);
    } catch (error) {
      logger.error('Error ending call:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to end call', 500);
    }
  }

  /**
   * Get call status from Vapi
   */
  async getCallStatus(callId) {
    if (!this.apiKey) {
      throw new AppError('Vapi API key not configured', 500);
    }

    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Vapi API error getting call status:', error);
        throw new AppError(`Failed to get call status: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error getting call status:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to get call status', 500);
    }
  }

  /**
   * Create or update assistant configuration
   */
  async configureAssistant(config: {
    name?: string;
    firstMessage?: string;
    model?: string;
    voice?: string;
    systemPrompt?: string;
  }) {
    if (!this.apiKey) {
      throw new AppError('Vapi API key not configured', 500);
    }

    try {
      const endpoint = this.assistantId
        ? `${this.baseUrl}/assistant/${this.assistantId}`
        : `${this.baseUrl}/assistant`;

      const method = this.assistantId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Vapi API error configuring assistant:', error);
        throw new AppError(`Failed to configure assistant: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      logger.info('Assistant configured:', data.id);
      
      return data;
    } catch (error) {
      logger.error('Error configuring assistant:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to configure assistant', 500);
    }
  }
}

// Export singleton instance
const vapiService = new VapiService();

module.exports = { vapiService };
