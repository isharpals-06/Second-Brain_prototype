import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:StreamingGateway');

export class StreamingGateway {
  createUnifiedStream(res, options = {}) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const emitEvent = (eventType, payload = {}) => {
      const data = JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), ...payload });
      res.write(`event: ${eventType}\ndata: ${data}\n\n`);
    };

    emitEvent('ThinkingStarted', { requestId: options.requestId || 'req_stream' });

    return {
      emitToken: (token) => emitEvent('TokenGenerated', { token }),
      emitToolRequest: (toolName, args) => emitEvent('ToolRequested', { toolName, args }),
      emitToolFinish: (toolName, result) => emitEvent('ToolFinished', { toolName, result }),
      emitReasoningStep: (thought) => emitEvent('ReasoningStep', { thought }),
      complete: (finalText = '') => {
        emitEvent('Completed', { text: finalText });
        res.end();
      },
      error: (err) => {
        emitEvent('Error', { error: err.message || String(err) });
        res.end();
      },
    };
  }
}

export const streamingGateway = new StreamingGateway();
