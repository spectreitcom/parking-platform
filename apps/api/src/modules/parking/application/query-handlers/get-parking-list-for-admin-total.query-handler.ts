import { GetParkingListForAdminTotalQuery } from '../queries/get-parking-list-for-admin-total.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getParkingListForAdminQueryWhere } from './get-parking-list-for-admin.query-handler';

@QueryHandler(GetParkingListForAdminTotalQuery)
export class GetParkingListForAdminTotalQueryHandler implements IQueryHandler<
  GetParkingListForAdminTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingListForAdminTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.parkingListForAdminRead.count({
      where: getParkingListForAdminQueryWhere(search),
    });
  }
}
