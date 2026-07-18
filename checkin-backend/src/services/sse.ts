import { Response } from 'express';

interface SSEClient {
  userId: string;
  tenantId: string;
  response: Response;
}

class SSEManager {
  private clients: SSEClient[] = [];

  // Register a client connection
  addClient(userId: string, tenantId: string, response: Response) {
    const newClient: SSEClient = { userId, tenantId, response };
    this.clients.push(newClient);

    // Keep connection alive
    response.write(': keepalive\n\n');

    // Remove client on disconnect
    response.on('close', () => {
      this.clients = this.clients.filter(c => c.response !== response);
    });
  }

  // Send an event to a specific user
  sendToUser(userId: string, event: string, data: any) {
    const targets = this.clients.filter(c => c.userId === userId);
    targets.forEach(client => {
      client.response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
  }

  // Send an event to all staff in a specific tenant (for task assignments)
  sendToTenantStaff(tenantId: string, event: string, data: any) {
    const targets = this.clients.filter(c => c.tenantId === tenantId);
    targets.forEach(client => {
      client.response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
  }

  // Broadcast globally (system notices)
  broadcast(event: string, data: any) {
    this.clients.forEach(client => {
      client.response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
  }
}

export const sseManager = new SSEManager();
