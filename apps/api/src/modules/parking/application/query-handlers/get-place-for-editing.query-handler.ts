import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlaceForEditingQuery } from '../queries/get-place-for-editing.query';
import { PlaceReadReadModel } from 'src/modules/parking/application/query-handlers/read-models/place-read.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetPlaceForEditingQuery)
export class GetPlaceForEditingQueryHandler implements IQueryHandler<
  GetPlaceForEditingQuery,
  PlaceReadReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlaceForEditingQuery): Promise<PlaceReadReadModel> {
    const { placeId } = query;

    const record = await this.prismaService.placeRead.findUnique({
      where: { placeId },
    });

    if (!record)
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Place with id ${placeId} not found`,
      );

    return new PlaceReadReadModel(
      record.placeId,
      record.name,
      record.latitude.toNumber(),
      record.longitude.toNumber(),
      record.placeTypeId,
      record.placeTypeName,
      record.address,
      record.active,
      record.version,
    );
  }
}
