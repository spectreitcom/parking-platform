import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { RefreshTokenStorage } from '../../application/ports/refresh-token.storage';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisRefreshTokenStorage
  implements RefreshTokenStorage, OnApplicationShutdown
{
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis(configService.get<string>('REDIS_URL')!);
  }

  async insert(adminUserId: string, tokenId: string): Promise<void> {
    await this.client.set(this.getKey(adminUserId), tokenId);
  }

  async validate(adminUserId: string, tokenId: string): Promise<boolean> {
    const storedTokenId = await this.client.get(this.getKey(adminUserId));
    return storedTokenId === tokenId;
  }

  async invalidate(adminUserId: string): Promise<void> {
    await this.client.del(this.getKey(adminUserId));
  }

  private getKey(adminUserId: string) {
    return `refreshToken:${adminUserId}`;
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
