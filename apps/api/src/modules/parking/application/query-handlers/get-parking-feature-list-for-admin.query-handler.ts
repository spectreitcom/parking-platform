import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingFeatureListForAdminQuery } from '../queries/get-parking-feature-list-for-admin.query';
import { ParkingFeatureListForAdminItemReadModel } from './read-models/parking-feature-list-for-admin-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getParkingFeatureListForAdminQueryWhere: (
  search?: string,
) => Prisma.ParkingFeatureReadWhereInput = (search?: string) =>
  search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {};

@QueryHandler(GetParkingFeatureListForAdminQuery)
export class GetParkingFeatureListForAdminQueryHandler implements IQueryHandler<
  GetParkingFeatureListForAdminQuery,
  ParkingFeatureListForAdminItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingFeatureListForAdminQuery,
  ): Promise<ParkingFeatureListForAdminItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.parkingFeatureRead.findMany({
      where: getParkingFeatureListForAdminQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        parkingFeatureId: 'asc',
      },
    });

    return records.map(
      (record) =>
        new ParkingFeatureListForAdminItemReadModel(
          record.parkingFeatureId,
          record.name,
          record.levels,
          record.version,
        ),
    );
  }
}
