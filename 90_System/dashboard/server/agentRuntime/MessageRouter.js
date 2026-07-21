import { MessageType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:MessageRouter');

export class MessageRouter {
  constructor() {
    this.messageHistory = [];
    this.maxHistory = 500;
  }

  sendMessage({ senderId, receiverId = 'broadcast', type = MessageType.EVENT, payload = {}, priority = 'normal' }) {
    const message = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: senderId,
      receiver: receiverId,
      type,
      priority,
      payload,
      timestamp: new Date().toISOString(),
      ttl: 3600
    };

    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }

    log.debug(`Routed message [${type}] from "${senderId}" to "${receiverId}"`);
    return message;
  }

  getMessages(receiverId = null) {
    if (!receiverId) return [...this.messageHistory];
    return this.messageHistory.filter(m => m.receiver === receiverId || m.receiver === 'broadcast');
  }
}

export const messageRouter = new MessageRouter();
