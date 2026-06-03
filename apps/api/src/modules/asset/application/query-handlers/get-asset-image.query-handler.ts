import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssetImageQuery } from '../queries/get-asset-image.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { FileUploader } from '../ports/file-uploader';
import { ImageProcessing } from '../ports/image-processing';
import { AppError } from 'src/shared/errors';
import { QueryAssetResponse } from '../../types';

@QueryHandler(GetAssetImageQuery)
export class GetAssetImageQueryHandler implements IQueryHandler<
  GetAssetImageQuery,
  QueryAssetResponse
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploader: FileUploader,
    private readonly imageProcessing: ImageProcessing,
  ) {}

  async execute(query: GetAssetImageQuery): Promise<QueryAssetResponse> {
    const { id, width, height } = query;

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

    const buffer = await this.fileUploader.getObjectFromStorage(record.key);

    const updatedBuffer = await this.imageProcessing.resize(
      buffer,
      width,
      height,
    );

    return {
      id: record.id,
      mimeType: record.mimeType,
      buffer: updatedBuffer,
    };
  }
}
