import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingByIdsQuery } from '../queries/get-parking-by-ids.query';
import { ParkingItemReadModel } from './read-models/parking-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingByIdsQuery)
export class GetParkingByIdsQueryHandler implements IQueryHandler<
  GetParkingByIdsQuery,
  ParkingItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingByIdsQuery): Promise<ParkingItemReadModel[]> {
    const { ids } = query;

    const records = await this.prismaService.parkingRead.findMany({
      where: { id: { in: ids } },
    });

    return records.map(
      (record) =>
        new ParkingItemReadModel(
          record.parkingId,
          record.name,
          record.longitude.toNumber(),
          record.latitude.toNumber(),
          record.statute,
          record.description,
          record.organizationId,
          record.assetIds,
          record.parkingFeatureIds,
          record.parkingAddonIds,
          record.placeId,
          record.active,
          record.address,
          record.createdAt,
          record.updatedAt,
          record.version,
        ),
    );
  }
}
