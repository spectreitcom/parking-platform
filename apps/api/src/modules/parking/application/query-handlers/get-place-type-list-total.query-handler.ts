import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlaceTypeListTotalQuery } from '../queries/get-place-type-list-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getPlaceTypeListQueryWhere } from './get-place-type-list.query-handler';

@QueryHandler(GetPlaceTypeListTotalQuery)
export class GetPlaceTypeListTotalQueryHandler implements IQueryHandler<
  GetPlaceTypeListTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlaceTypeListTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.placeTypeRead.count({
      where: getPlaceTypeListQueryWhere(search),
    });
  }
}
