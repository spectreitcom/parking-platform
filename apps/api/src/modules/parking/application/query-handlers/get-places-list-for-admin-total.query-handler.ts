import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlacesListForAdminTotalQuery } from '../queries/get-places-list-for-admin-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getPlacesListForAdminQueryWhere } from './get-places-list-for-admin.query-handler';

@QueryHandler(GetPlacesListForAdminTotalQuery)
export class GetPlacesListForAdminTotalQueryHandler implements IQueryHandler<
  GetPlacesListForAdminTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPlacesListForAdminTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.placeRead.count({
      where: getPlacesListForAdminQueryWhere(search),
    });
  }
}
