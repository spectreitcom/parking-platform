import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ResetPasswordTokenStorage } from '../../application/ports/reset-password-token.storage';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

const RESET_PASSWORD_TOKEN_TTL_SECONDS = 1 * 24 * 60 * 60; // 1 day

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

  async insert(userId: string, tokenHash: string): Promise<void> {
    await this.client.set(
      this.getKey(tokenHash),
      userId,
      'EX',
      RESET_PASSWORD_TOKEN_TTL_SECONDS,
    );
  }

  async validate(tokenHash: string): Promise<string | false> {
    const userId = await this.client.get(this.getKey(tokenHash));
    return userId ?? false;
  }

  async invalidate(tokenHash: string): Promise<void> {
    await this.client.del(this.getKey(tokenHash));
  }

  private getKey(tokenHash: string) {
    return `resetPasswordToken:user:${tokenHash}`;
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
