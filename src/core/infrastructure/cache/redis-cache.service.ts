import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheService } from '../../application/ports/cache.port';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;
  private warned = false;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.client = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });

    this.client.on('error', (err) => {
      if (!this.warned) {
        this.logger.warn(`Redis indisponivel, cache desativado: ${err.message}`);
        this.warned = true;
      }
    });
    this.client.connect().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {

    }
  }

  async delByPrefix(prefix: string): Promise<void> {
    try {
      const stream = this.client.scanStream({
        match: `${prefix}*`,
        count: 100,
      });
      const keys: string[] = [];
      for await (const batch of stream) {
        keys.push(...(batch as string[]));
      }
      if (keys.length) {
        await this.client.del(...keys);
      }
    } catch {

    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {

    }
  }
}
