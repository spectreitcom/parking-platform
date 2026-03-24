import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlaceTypeListQuery } from '../queries/get-place-type-list.query';
import { PlaceTypeListItemReadModel } from './read-models/place-type-list-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getPlaceTypeListQueryWhere: (
  search?: string,
) => Prisma.PlaceTypeReadWhereInput = (search?: string) =>
  search
    ? {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    : {};

@QueryHandler(GetPlaceTypeListQuery)
export class GetPlaceTypeListQueryHandler implements IQueryHandler<
  GetPlaceTypeListQuery,
  PlaceTypeListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetPlaceTypeListQuery,
  ): Promise<PlaceTypeListItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.placeTypeRead.findMany({
      where: getPlaceTypeListQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        placeTypeId: 'asc',
      },
    });

    return records.map(
      (record) =>
        new PlaceTypeListItemReadModel(
          record.placeTypeId,
          record.name,
          record.version,
        ),
    );
  }
}
