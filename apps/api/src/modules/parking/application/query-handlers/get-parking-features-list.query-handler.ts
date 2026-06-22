import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ParkingFeatureReadModel } from './read-models/parking-feature.read-model';
import { GetParkingFeaturesListQuery } from '../queries/get-parking-features-list.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getParkingFeaturesListQueryWhere: (
  search?: string,
  levels?: string[],
) => Prisma.ParkingFeatureReadWhereInput = (search, levels) => ({
  name: search ? { contains: search, mode: 'insensitive' } : undefined,
  levels: levels && levels.length > 0 ? { hasSome: levels } : undefined,
});

@QueryHandler(GetParkingFeaturesListQuery)
export class GetParkingFeaturesListQueryHandler implements IQueryHandler<
  GetParkingFeaturesListQuery,
  ParkingFeatureReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingFeaturesListQuery,
  ): Promise<ParkingFeatureReadModel[]> {
    const { search, levels, page, limit } = query;

    const records = await this.prismaService.parkingFeatureRead.findMany({
      where: getParkingFeaturesListQueryWhere(search, levels),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        parkingFeatureId: 'asc',
      },
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
