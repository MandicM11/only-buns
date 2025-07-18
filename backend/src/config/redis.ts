import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.connected = true;
    });
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isConnected() {
    return this.connected;
  }
}

export const redisClient = new RedisClient();
