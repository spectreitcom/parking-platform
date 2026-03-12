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
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in the environment variables');
    }
    this.client = new Redis(redisUrl);
  }

  async insert(organizationUserId: string, tokenId: string): Promise<void> {
    await this.client.set(this.getKey(organizationUserId), tokenId);
  }

  async validate(
    organizationUserId: string,
    tokenId: string,
  ): Promise<boolean> {
    const storedTokenId = await this.client.get(
      this.getKey(organizationUserId),
    );
    return storedTokenId === tokenId;
  }

  async invalidate(organizationUserId: string): Promise<void> {
    await this.client.del(this.getKey(organizationUserId));
  }

  private getKey(organizationUserId: string) {
    return `organization-user:refreshToken:${organizationUserId}`;
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
