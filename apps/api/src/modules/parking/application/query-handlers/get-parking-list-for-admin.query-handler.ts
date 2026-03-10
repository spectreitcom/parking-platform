import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingListForAdminQuery } from '../queries/get-parking-list-for-admin.query';
import { ParkingListForAdminItemReadModel } from './read-models/parking-list-for-admin-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getParkingListForAdminQueryWhere: (
  search?: string,
) => Prisma.ParkingListForAdminReadWhereInput = (search?: string) => ({
  OR: [
    {
      parkingName: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      organizationName: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      placeName: {
        contains: search,
        mode: 'insensitive',
      },
    },
  ],
});

@QueryHandler(GetParkingListForAdminQuery)
export class GetParkingListForAdminQueryHandler implements IQueryHandler<
  GetParkingListForAdminQuery,
  ParkingListForAdminItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingListForAdminQuery,
  ): Promise<ParkingListForAdminItemReadModel[]> {
    const { page, search, limit } = query;

    const records = await this.prismaService.parkingListForAdminRead.findMany({
      where: getParkingListForAdminQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map(
      (record) =>
        new ParkingListForAdminItemReadModel(
          record.parkingId,
          { id: record.organizationId, name: record.organizationName },
          { id: record.placeId, name: record.placeName },
          record.parkingName,
          record.parkingActive,
          record.parkingSpotsNumber,
          record.parkingAddress,
        ),
    );
  }
}
