import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingsByOrganizationAndOrganizationUserForManagerQuery } from '../queries/get-parkings-by-organization-and-organization-user-for-manager.query';
import { ParkingForManagerItemReadModel } from './read-models/parking-for-manager-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingsByOrganizationAndOrganizationUserForManagerQuery)
export class GetParkingsByOrganizationAndOrganizationUserForManagerQueryHandler implements IQueryHandler<
  GetParkingsByOrganizationAndOrganizationUserForManagerQuery,
  ParkingForManagerItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingsByOrganizationAndOrganizationUserForManagerQuery,
  ): Promise<ParkingForManagerItemReadModel[]> {
    const { organizationId, page, limit } = query;

    const records = await this.prismaService.parkingRead.findMany({
      where: {
        organizationId,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return records.map(
      (record) =>
        new ParkingForManagerItemReadModel(
          record.parkingId,
          record.name,
          record.active,
          record.placeId,
          record.version,
        ),
    );
  }
}
