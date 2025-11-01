import { NextRequest } from 'next/server';
import { messageSSEManager } from '../../../../lib/message-sse';
import { getCurrentUser } from '../../../../lib/auth';

// Force Node.js runtime for SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('[MessageSSE] New SSE connection request');

  // Verify user is authenticated
  const currentUser = await getCurrentUser();
  if (!currentUser?.userId) {
    console.log('[MessageSSE] Unauthorized connection attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = currentUser.userId;
  console.log('[MessageSSE] Authenticated user:', userId);

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Generate unique client ID
      const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Register this client with the SSE manager
      messageSSEManager.addClient(clientId, userId, controller);

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          console.error('[MessageSSE] Heartbeat error:', error);
          clearInterval(heartbeatInterval);
          messageSSEManager.removeClient(clientId);
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        console.log('[MessageSSE] Client connection aborted:', clientId);
        clearInterval(heartbeatInterval);
        messageSSEManager.removeClient(clientId);
      });
    },
  });

  // Return SSE response with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}
