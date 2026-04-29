import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingByParkingSpotIdQuery } from '../queries/get-parking-by-parking-spot-id.query';
import { ParkingItemReadModel } from './read-models/parking-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingByParkingSpotIdQuery)
export class GetParkingByParkingSpotIdQueryHandler implements IQueryHandler<
  GetParkingByParkingSpotIdQuery,
  ParkingItemReadModel | null
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingByParkingSpotIdQuery,
  ): Promise<ParkingItemReadModel | null> {
    const { parkingSpotId } = query;

    const parkingSpot = await this.prismaService.parkingSpot.findUnique({
      where: { id: parkingSpotId },
      include: { parking: true },
    });

    const parkingRead = await this.prismaService.parkingRead.findUnique({
      where: {
        parkingId: parkingSpot?.parking.id,
      },
    });

    if (!parkingRead) return null;

    return new ParkingItemReadModel(
      parkingRead.parkingId,
      parkingRead.name,
      parkingRead.longitude.toNumber(),
      parkingRead.latitude.toNumber(),
      parkingRead.statute,
      parkingRead.description,
      parkingRead.organizationId,
      parkingRead.assetIds,
      parkingRead.parkingFeatureIds,
      parkingRead.parkingAddonIds,
      parkingRead.placeId,
      parkingRead.active,
      parkingRead.address,
      parkingRead.createdAt,
      parkingRead.updatedAt,
      parkingRead.version,
    );
  }
}
