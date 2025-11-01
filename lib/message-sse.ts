// Server-Sent Events (SSE) manager for messages
// This allows real-time updates to all connected clients when messages change

type SSEClient = {
  id: string;
  userId: string; // Track which user this connection belongs to
  controller: ReadableStreamDefaultController;
  send: (data: unknown) => void;
};

class MessageSSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(id: string, userId: string, controller: ReadableStreamDefaultController) {
    const client: SSEClient = {
      id,
      userId,
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
    console.log(`[MessageSSE] Client connected: ${id} (user: ${userId}). Total clients: ${this.clients.size}`);
    
    // Send initial connection confirmation
    client.send({ type: 'connected', timestamp: new Date().toISOString() });
  }

  removeClient(id: string) {
    if (this.clients.has(id)) {
      this.clients.delete(id);
      console.log(`[MessageSSE] Client disconnected: ${id}. Total clients: ${this.clients.size}`);
    }
  }

  // Send to specific user
  sendToUser(userId: string, event: { type: string; data: unknown }) {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        client.send(event);
        count++;
      }
    });
    console.log(`[MessageSSE] Sent ${event.type} to ${count} clients for user ${userId}`);
  }

  // Broadcast to all connected clients
  broadcast(event: { type: string; data: unknown }) {
    console.log(`[MessageSSE] Broadcasting to ${this.clients.size} clients:`, event.type);
    this.clients.forEach((client) => {
      client.send(event);
    });
  }

  // Notify when a new message is created (send to recipient)
  notifyMessageCreated(messageData: { receiverUuid: string; [key: string]: unknown }) {
    this.sendToUser(messageData.receiverUuid, { 
      type: 'messageCreated', 
      data: messageData 
    });
  }

  // Notify when a message is marked as read (send to sender)
  notifyMessageRead(messageData: { senderUuid: string; uuid: string; [key: string]: unknown }) {
    this.sendToUser(messageData.senderUuid, { 
      type: 'messageRead', 
      data: messageData 
    });
  }

  // Notify when unread count changes for a user
  notifyUnreadCountUpdate(userId: string, unreadCount: number) {
    this.sendToUser(userId, { 
      type: 'unreadCountUpdate', 
      data: { unreadCount } 
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  getClientCountForUser(userId: string): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        count++;
      }
    });
    return count;
  }
}

// Singleton instance
export const messageSSEManager = new MessageSSEManager();
