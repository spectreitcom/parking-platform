import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlaceByIdsQuery } from '../queries/get-place-by-ids.query';
import { PlaceReadReadModel } from './read-models/place-read.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetPlaceByIdsQuery)
export class GetPlaceByIdsQueryHandler implements IQueryHandler<
  GetPlaceByIdsQuery,
  PlaceReadReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlaceByIdsQuery): Promise<PlaceReadReadModel[]> {
    const { ids } = query;

    const records = await this.prismaService.placeRead.findMany({
      where: { placeId: { in: ids } },
    });

    return records.map(
      (record) =>
        new PlaceReadReadModel(
          record.placeId,
          record.name,
          record.latitude.toNumber(),
          record.longitude.toNumber(),
          record.placeTypeId,
          record.placeTypeName,
          record.address,
          record.active,
          record.version,
        ),
    );
  }
}
