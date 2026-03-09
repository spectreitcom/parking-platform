import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlacesListForAdminQuery } from '../queries/get-places-list-for-admin.query';
import { PlaceListForAdminItemReadModel } from './read-models/place-list-for-admin-item.read-model';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

export const getPlacesListForAdminQueryWhere: (
  search?: string,
) => Prisma.PlaceReadWhereInput = (search: string) => ({
  OR: [
    {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      placeTypeName: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      address: {
        contains: search,
        mode: 'insensitive',
      },
    },
  ],
});

@QueryHandler(GetPlacesListForAdminQuery)
export class GetPlacesListForAdminQueryHandler implements IQueryHandler<
  GetPlacesListForAdminQuery,
  PlaceListForAdminItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetPlacesListForAdminQuery,
  ): Promise<PlaceListForAdminItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.placeRead.findMany({
      where: getPlacesListForAdminQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map(
      (record) =>
        new PlaceListForAdminItemReadModel(
          record.placeId,
          record.name,
          record.address,
          record.active,
          record.placeTypeName,
        ),
    );
  }
}
