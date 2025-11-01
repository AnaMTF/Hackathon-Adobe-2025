// Server-Sent Events (SSE) manager for calendar events
// This allows real-time updates to all connected clients when events change

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  send: (data: unknown) => void;
};

class EventSSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(id: string, controller: ReadableStreamDefaultController) {
    const client: SSEClient = {
      id,
      controller,
      send: (data: unknown) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
          this.removeClient(id);
        }
      },
    };
    
    this.clients.set(id, client);
    console.log(`SSE client connected: ${id}. Total clients: ${this.clients.size}`);
    
    // Send initial connection confirmation
    client.send({ type: 'connected', timestamp: new Date().toISOString() });
  }

  removeClient(id: string) {
    if (this.clients.has(id)) {
      this.clients.delete(id);
      console.log(`SSE client disconnected: ${id}. Total clients: ${this.clients.size}`);
    }
  }

  broadcast(event: { type: string; data: unknown }) {
    console.log(`Broadcasting to ${this.clients.size} clients:`, event.type);
    this.clients.forEach((client) => {
      client.send(event);
    });
  }

  notifyEventCreated(eventData: unknown) {
    this.broadcast({ type: 'eventCreated', data: eventData });
  }

  notifyEventUpdated(eventData: unknown) {
    this.broadcast({ type: 'eventUpdated', data: eventData });
  }

  notifyEventDeleted(eventId: string) {
    this.broadcast({ type: 'eventDeleted', data: { uuid: eventId } });
  }

  getClientCount() {
    return this.clients.size;
  }
}

// Singleton instance
export const eventSSEManager = new EventSSEManager();
