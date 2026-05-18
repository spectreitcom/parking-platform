import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingFeatureByIdsQuery } from '../queries/get-parking-feature-by-ids.query';
import { ParkingFeatureReadModel } from './read-models/parking-feature.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingFeatureByIdsQuery)
export class GetParkingFeatureByIdsQueryHandler implements IQueryHandler<
  GetParkingFeatureByIdsQuery,
  ParkingFeatureReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingFeatureByIdsQuery,
  ): Promise<ParkingFeatureReadModel[]> {
    const { ids } = query;

    const records = await this.prismaService.parkingFeatureRead.findMany({
      where: { parkingFeatureId: { in: ids } },
    });

    return records.map(
      (record) =>
        new ParkingFeatureReadModel(
          record.parkingFeatureId,
          record.name,
          record.levels,
          record.version,
        ),
    );
  }
}
