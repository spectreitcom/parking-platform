import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { RefreshTokenStorage } from '../../application/ports/refresh-token.storage';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class RedisRefreshTokenStorage
  implements RefreshTokenStorage, OnApplicationShutdown
{
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in the environment variables');
    }
    this.client = new Redis(redisUrl);
  }

  async insert(adminUserId: string, tokenId: string): Promise<void> {
    await this.client.set(
      this.getKey(adminUserId),
      tokenId,
      'EX',
      REFRESH_TOKEN_TTL_SECONDS,
    );
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
