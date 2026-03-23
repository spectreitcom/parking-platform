import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingAddonListForAdminQuery } from '../queries/get-parking-addon-list-for-admin.query';
import { ParkingAddonListForAdminItemReadModel } from './read-models/parking-addon-list-for-admin-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getParkingAddonListForAdminQueryWhere: (
  search?: string,
) => Prisma.ParkingAddonReadWhereInput = (search?: string) =>
  search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            priceInPln: !Number.isNaN(parseFloat(search))
              ? parseFloat(search)
              : undefined,
          },
        ],
      }
    : {};

@QueryHandler(GetParkingAddonListForAdminQuery)
export class GetParkingAddonListForAdminQueryHandler implements IQueryHandler<
  GetParkingAddonListForAdminQuery,
  ParkingAddonListForAdminItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingAddonListForAdminQuery,
  ): Promise<ParkingAddonListForAdminItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.parkingAddonRead.findMany({
      where: getParkingAddonListForAdminQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map(
      (record) =>
        new ParkingAddonListForAdminItemReadModel(
          record.parkingAddonId,
          record.code,
          record.name,
          record.priceInPln.toNumber(),
          record.version,
        ),
    );
  }
}
