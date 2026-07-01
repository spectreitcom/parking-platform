import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlacesTotalQuery } from '../queries/get-places-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getPlacesQueryWhere } from './get-places.query-handler';

@QueryHandler(GetPlacesTotalQuery)
export class GetPlacesTotalQueryHandler implements IQueryHandler<
  GetPlacesTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlacesTotalQuery): Promise<number> {
    const { search, placeTypeId } = query;

    return this.prismaService.placeRead.count({
      where: getPlacesQueryWhere(placeTypeId, search),
    });
  }
}
