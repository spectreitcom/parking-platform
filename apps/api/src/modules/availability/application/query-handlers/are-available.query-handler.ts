import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AreAvailableQuery } from '../queries/are-available.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(AreAvailableQuery)
export class AreAvailableQueryHandler implements IQueryHandler<
  AreAvailableQuery,
  { parkingSpotId: string; available: boolean }[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: AreAvailableQuery,
  ): Promise<{ parkingSpotId: string; available: boolean }[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: {
        parkingSpotId: {
          in: query.parkingSpotIds,
        },
      },
    });

    const availabilityMap = new Map(
      availabilities.map((a) => [a.parkingSpotId, a.available]),
    );

    return query.parkingSpotIds.map((id) => ({
      parkingSpotId: id,
      available: availabilityMap.get(id) ?? true,
    }));
  }
}
