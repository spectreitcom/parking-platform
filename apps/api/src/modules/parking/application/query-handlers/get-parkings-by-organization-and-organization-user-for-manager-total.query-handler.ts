import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingsByOrganizationAndOrganizationUserForManagerTotalQuery } from '../queries/get-parkings-by-organization-and-organization-user-for-manager-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingsByOrganizationAndOrganizationUserForManagerTotalQuery)
export class GetParkingsByOrganizationAndOrganizationUserForManagerTotalQueryHandler implements IQueryHandler<
  GetParkingsByOrganizationAndOrganizationUserForManagerTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingsByOrganizationAndOrganizationUserForManagerTotalQuery,
  ): Promise<number> {
    const { organizationId } = query;

    return this.prismaService.parkingRead.count({
      where: {
        organizationId,
      },
    });
  }
}
