import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingByIdQuery } from '../queries/get-parking-by-id.query';
import { ParkingItemReadModel } from './read-models/parking-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetParkingByIdQuery)
export class GetParkingByIdQueryHandler implements IQueryHandler<
  GetParkingByIdQuery,
  ParkingItemReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingByIdQuery): Promise<ParkingItemReadModel> {
    const { id } = query;

    const record = await this.prismaService.parkingRead.findUnique({
      where: { parkingId: id },
    });

    if (!record) {
      throw new AppError('ENTITY_NOT_FOUND', `Parking with id ${id} not found`);
    }

    return new ParkingItemReadModel(
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
    );
  }
}
