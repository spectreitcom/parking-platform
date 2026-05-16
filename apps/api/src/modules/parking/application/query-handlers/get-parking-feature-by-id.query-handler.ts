import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingFeatureByIdQuery } from '../queries/get-parking-feature-by-id.query';
import { ParkingFeatureItemReadModel } from './read-models/parking-feature-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetParkingFeatureByIdQuery)
export class GetParkingFeatureByIdQueryHandler implements IQueryHandler<
  GetParkingFeatureByIdQuery,
  ParkingFeatureItemReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingFeatureByIdQuery,
  ): Promise<ParkingFeatureItemReadModel> {
    const { id } = query;

    const record = await this.prismaService.parkingFeatureRead.findUnique({
      where: { parkingFeatureId: id },
    });

    if (!record) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking feature with id ${id} not found`,
      );
    }

    return new ParkingFeatureItemReadModel(
      record.parkingFeatureId,
      record.name,
      record.levels,
      record.version,
    );
  }
}
