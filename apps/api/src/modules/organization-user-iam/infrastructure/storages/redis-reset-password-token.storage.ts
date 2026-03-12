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
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in the environment variables');
    }
    this.client = new Redis(redisUrl);
  }

  async insert(
    organizationUserId: string,
    resetPasswordTokenHash: string,
  ): Promise<void> {
    await this.client.set(
      this.getKey(resetPasswordTokenHash),
      organizationUserId,
      'EX',
      3600,
    );
  }

  async validate(resetPasswordTokenHash: string): Promise<false | string> {
    const organizationUserId = await this.client.get(
      this.getKey(resetPasswordTokenHash),
    );
    if (!organizationUserId) return false;
    return organizationUserId;
  }

  async invalidate(resetPasswordTokenHash: string): Promise<void> {
    await this.client.del(this.getKey(resetPasswordTokenHash));
  }

  private getKey(tokenHash: string) {
    return `organization-user:resetPasswordToken:${tokenHash}`;
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
