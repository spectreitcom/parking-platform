import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingSpotsByParkingIdTotalQuery } from '../queries/get-parking-spots-by-parking-id-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetParkingSpotsByParkingIdTotalQuery)
export class GetParkingSpotsByParkingIdTotalQueryHandler implements IQueryHandler<
  GetParkingSpotsByParkingIdTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingSpotsByParkingIdTotalQuery): Promise<number> {
    return await this.prismaService.parkingSpotRead.count({
      where: {
        parkingId: query.parkingId,
      },
    });
  }
}
