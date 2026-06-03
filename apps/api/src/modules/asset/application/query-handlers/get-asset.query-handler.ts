import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssetQuery } from '../queries/get-asset.query';
import { FileUploader } from '../ports/file-uploader';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';
import { QueryAssetResponse } from '../../types';

@QueryHandler(GetAssetQuery)
export class GetAssetQueryHandler implements IQueryHandler<
  GetAssetQuery,
  QueryAssetResponse
> {
  constructor(
    private readonly fileUploader: FileUploader,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(query: GetAssetQuery): Promise<QueryAssetResponse> {
    const { id } = query;

    const record = await this.prismaService.asset.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      throw new AppError('ENTITY_NOT_FOUND', 'Asset not found');
    }

    const buffer = await this.fileUploader.getObjectFromStorage(record.key);

    return {
      id: record.id,
      mimeType: record.mimeType,
      buffer,
    };
  }
}
