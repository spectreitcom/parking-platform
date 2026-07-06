import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlacesQuery } from '../queries/get-places.query';
import { PlaceReadReadModel } from './read-models/place-read.read-model';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

export const getPlacesQueryWhere = (
  placeTypeId: string,
  search?: string,
): Prisma.PlaceReadWhereInput => {
  const where: Prisma.PlaceReadWhereInput = {
    placeTypeId,
    active: true,
  };

  if (search) {
    where.OR = [
      {
        name: {
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
    ];
  }

  return where;
};

@QueryHandler(GetPlacesQuery)
export class GetPlacesQueryHandler implements IQueryHandler<
  GetPlacesQuery,
  PlaceReadReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlacesQuery): Promise<PlaceReadReadModel[]> {
    const { search, page, limit, placeTypeId } = query;

    const records = await this.prismaService.placeRead.findMany({
      where: getPlacesQueryWhere(placeTypeId, search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return records.map(
      (record) =>
        new PlaceReadReadModel(
          record.placeId,
          record.name,
          record.latitude.toNumber(),
          record.longitude.toNumber(),
          record.placeTypeId,
          record.placeTypeName,
          record.address,
          record.active,
          record.version,
        ),
    );
  }
}
