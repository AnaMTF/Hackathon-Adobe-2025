import { eventSSEManager } from '../../../../lib/event-sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let keepAliveInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      // Add client to SSE manager
      eventSSEManager.addClient(clientId, controller);

      // Send keep-alive ping every 30 seconds
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
        } catch (error) {
          console.error('Keep-alive error:', error);
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
          }
          eventSSEManager.removeClient(clientId);
        }
      }, 30000);

      // Cleanup on close
      return () => {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        eventSSEManager.removeClient(clientId);
      };
    },
    cancel() {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      eventSSEManager.removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
