import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IsAvailableQuery } from '../queries/is-available.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(IsAvailableQuery)
export class IsAvailableQueryHandler implements IQueryHandler<
  IsAvailableQuery,
  boolean
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: IsAvailableQuery): Promise<boolean> {
    const availability = await this.prisma.availability.findUnique({
      where: {
        parkingSpotId: query.parkingSpotId,
      },
    });

    return availability ? availability.available : true;
  }
}
