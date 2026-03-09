import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ResetPasswordTokenStorage } from '../../application/ports/reset-password-token.storage';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisResetPasswordTokenStorage
  implements ResetPasswordTokenStorage, OnApplicationShutdown
{
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis(configService.get<string>('REDIS_URL')!);
  }

  async insert(
    adminUserId: string,
    resetPasswordTokenHash: string,
  ): Promise<void> {
    await this.client.set(resetPasswordTokenHash, adminUserId, 'EX', 3600);
  }

  async validate(resetPasswordTokenHash: string): Promise<false | string> {
    const adminUserId = await this.client.get(resetPasswordTokenHash);
    if (!adminUserId) return false;
    return adminUserId;
  }

  async invalidate(resetPasswordTokenHash: string): Promise<void> {
    await this.client.del(resetPasswordTokenHash);
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
