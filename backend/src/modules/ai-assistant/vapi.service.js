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
    options
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
            number: phoneNumber,
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
   * Create a web call session for incoming calls
   * This is used when Twilio forwards an incoming call to Vapi
   * 
   * @param {Object} options - Configuration for the web call
   * @param {string} options.assistantId - ID of the Vapi assistant (optional, uses default if not provided)
   * @param {Object} options.customer - Customer information
   * @param {string} options.customer.number - Customer phone number
   * @param {Object} options.metadata - Additional metadata to pass to Vapi
   * @returns {Promise<string>} The web call ID that can be used for connection
   */
  async createWebCall(options) {
    if (!this.apiKey || !this.assistantId) {
      throw new AppError('Vapi not configured', 500);
    }

    try {
      const response = await fetch(`${this.baseUrl}/call/web`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          assistantId: this.assistantId,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Vapi web call API error:', error);
        throw new AppError(`Vapi web call error: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      
      // Normalize the response to always return a call ID
      const callId = data.id || data.callId || data.webCallId;
      
      if (!callId) {
        logger.error('Vapi web call response missing ID:', data);
        throw new AppError('Invalid Vapi web call response', 500);
      }
      
      logger.info(`Web call created, ID: ${callId}`);
      
      return callId;
    } catch (error) {
      logger.error('Error creating web call:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to create web call', 500);
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
  async configureAssistant(config) {
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
