import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingAddonByIdsQuery } from '../queries/get-parking-addon-by-ids.query';
import { ParkingAddonReadModel } from './read-models/parking-addon.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingAddonByIdsQuery)
export class GetParkingAddonByIdsQueryHandler implements IQueryHandler<
  GetParkingAddonByIdsQuery,
  ParkingAddonReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetParkingAddonByIdsQuery,
  ): Promise<ParkingAddonReadModel[]> {
    const { ids } = query;

    const records = await this.prismaService.parkingAddonRead.findMany({
      where: { parkingAddonId: { in: ids } },
    });

    return records.map(
      (record) =>
        new ParkingAddonReadModel(
          record.parkingAddonId,
          record.code,
          record.name,
          record.price,
          record.priceInPln.toNumber(),
          record.version,
        ),
    );
  }
}
