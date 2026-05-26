import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingSpotsByParkingIdQuery } from '../queries/get-parking-spots-by-parking-id.query';
import { ParkingSpotReadReadModel } from 'src/modules/parking/application/query-handlers/read-models/parking-spot-read.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingSpotsByParkingIdQuery)
export class GetParkingSpotsByParkingIdQueryHandler implements IQueryHandler<
  GetParkingSpotsByParkingIdQuery,
  ParkingSpotReadReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingSpotsByParkingIdQuery,
  ): Promise<ParkingSpotReadReadModel[]> {
    const items = await this.prismaService.parkingSpotRead.findMany({
      where: {
        parkingId: query.parkingId,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return items.map(
      (item) =>
        new ParkingSpotReadReadModel(
          item.parkingSpotId,
          item.parkingId,
          item.price,
          item.pricePLN,
          item.active,
          item.parkingSpotFeatureIds,
          item.version,
          item.organizationId,
        ),
    );
  }
}
