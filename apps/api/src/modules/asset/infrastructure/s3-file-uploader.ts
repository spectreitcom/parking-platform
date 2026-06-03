import { Injectable } from '@nestjs/common';
import { FileUploader } from '../application/ports/file-uploader';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

@Injectable()
export class S3FileUploader implements FileUploader {
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: config.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const key = `${randomUUID()}.${extname(file.originalname)}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get<string>('AWS_BUCKET')!,
        Body: file.buffer,
        Key: key,
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  async getObjectFromStorage(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.get<string>('AWS_BUCKET')!,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`Object with key ${key} not found in S3`);
    }

    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }
}
