import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingFeatureListForAdminTotalQuery } from '../queries/get-parking-feature-list-for-admin-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getParkingFeatureListForAdminQueryWhere } from './get-parking-feature-list-for-admin.query-handler';

@QueryHandler(GetParkingFeatureListForAdminTotalQuery)
export class GetParkingFeatureListForAdminTotalQueryHandler implements IQueryHandler<
  GetParkingFeatureListForAdminTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingFeatureListForAdminTotalQuery,
  ): Promise<number> {
    const { search } = query;

    return this.prismaService.parkingFeatureRead.count({
      where: getParkingFeatureListForAdminQueryWhere(search),
    });
  }
}
