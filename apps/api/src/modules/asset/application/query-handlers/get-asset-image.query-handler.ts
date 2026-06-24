import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssetImageQuery } from '../queries/get-asset-image.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { FileUploader } from '../ports/file-uploader';
import { ImageProcessing } from '../ports/image-processing';
import { AppError } from 'src/shared/errors';
import { QueryAssetResponse } from '../../types';
import { createHash } from 'node:crypto';
import { AssetsStorage } from '../ports/assets.storage';

@QueryHandler(GetAssetImageQuery)
export class GetAssetImageQueryHandler implements IQueryHandler<
  GetAssetImageQuery,
  QueryAssetResponse
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploader: FileUploader,
    private readonly imageProcessing: ImageProcessing,
    private readonly assetsStorage: AssetsStorage,
  ) {}

  async execute(query: GetAssetImageQuery): Promise<QueryAssetResponse> {
    const { id, width, height, userId } = query;

    const record = await this.prismaService.asset.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      throw new AppError('ENTITY_NOT_FOUND', 'Asset not found');
    }

    if (!record.mimeType.startsWith('image/')) {
      throw new AppError('VALIDATION_ERROR', 'Asset is not an image');
    }

    const cachedBuffer = await this.assetsStorage.getImage(
      id,
      userId,
      width,
      height,
    );

    const cachedEtag = await this.assetsStorage.getImageEtag(
      id,
      userId,
      width,
      height,
    );

    if (cachedBuffer && cachedEtag) {
      return {
        id: record.id,
        mimeType: record.mimeType,
        buffer: cachedBuffer,
        etag: cachedEtag,
      };
    }

    const buffer = await this.fileUploader.getObjectFromStorage(record.key);

    const updatedBuffer = await this.imageProcessing.resize(
      buffer,
      width,
      height,
    );

    const etag = `"${createHash('md5').update(updatedBuffer).digest('hex')}"`;

    await this.assetsStorage.insertImage(
      record.id,
      userId,
      updatedBuffer,
      width,
      height,
    );

    await this.assetsStorage.insertImageEtag(
      record.id,
      userId,
      etag,
      width,
      height,
    );

    return {
      id: record.id,
      mimeType: record.mimeType,
      buffer: updatedBuffer,
      etag,
    };
  }
}
