import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingAddonListForAdminTotalQuery } from '../queries/get-parking-addon-list-for-admin-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getParkingAddonListForAdminQueryWhere } from './get-parking-addon-list-for-admin.query-handler';

@QueryHandler(GetParkingAddonListForAdminTotalQuery)
export class GetParkingAddonListForAdminTotalQueryHandler implements IQueryHandler<
  GetParkingAddonListForAdminTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingAddonListForAdminTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.parkingAddonRead.count({
      where: getParkingAddonListForAdminQueryWhere(search),
    });
  }
}
