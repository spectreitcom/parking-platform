import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingSpotByIdQuery } from '../queries/get-parking-spot-by-id.query';
import { ParkingSpotReadReadModel } from './read-models/parking-spot-read.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetParkingSpotByIdQuery)
export class GetParkingSpotByIdQueryHandler implements IQueryHandler<
  GetParkingSpotByIdQuery,
  ParkingSpotReadReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingSpotByIdQuery,
  ): Promise<ParkingSpotReadReadModel> {
    const { id } = query;

    const record = await this.prismaService.parkingSpotRead.findUnique({
      where: { parkingSpotId: id },
    });

    if (!record) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking spot with id ${id} not found`,
      );
    }

    return new ParkingSpotReadReadModel(
      record.parkingSpotId,
      record.parkingId,
      record.price,
      record.pricePLN,
      record.active,
      record.parkingSpotFeatureIds,
      record.version,
      record.organizationId,
    );
  }
}
