import { Injectable } from '@nestjs/common';
import { AssetsStorage } from '../application/ports/assets.storage';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

const TTL_SECONDS = 3 * 60 * 60;

@Injectable()
export class RedisAssetsStorage implements AssetsStorage {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in the environment variables');
    }
    this.client = new Redis(redisUrl);
  }

  async insertImage(
    assetId: string,
    userId: string,
    buffer: Buffer,
    width?: number,
    height?: number,
  ) {
    await this.client.set(
      this.getImageKey(assetId, userId, width, height),
      buffer,
      'EX',
      TTL_SECONDS,
    );
  }

  async getImage(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ): Promise<Buffer | null> {
    return await this.client.getBuffer(
      this.getImageKey(assetId, userId, width, height),
    );
  }

  async insertImageEtag(
    assetId: string,
    userId: string,
    etag: string,
    width?: number,
    height?: number,
  ) {
    await this.client.set(
      this.getImageEtagKey(assetId, userId, width, height),
      etag,
      'EX',
      TTL_SECONDS,
    );
  }

  async getImageEtag(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ) {
    return await this.client.get(
      this.getImageEtagKey(assetId, userId, width, height),
    );
  }

  private getImageKey(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ) {
    return `${assetId}:${userId}:${width ?? ''}:${height ?? ''}:image`;
  }

  private getImageEtagKey(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ) {
    return `${assetId}:${userId}:${width ?? ''}:${height ?? ''}:etag`;
  }
}
