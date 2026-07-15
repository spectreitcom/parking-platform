import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsByParkingIdTotalQuery } from '../queries/get-reservations-by-parking-id-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getReservationsByParkingIdQueryWhere } from './get-reservations-by-parking-id.query-handler';

@QueryHandler(GetReservationsByParkingIdTotalQuery)
export class GetReservationsByParkingIdTotalQueryHandler implements IQueryHandler<
  GetReservationsByParkingIdTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetReservationsByParkingIdTotalQuery): Promise<number> {
    const { parkingId, search } = query;

    return this.prismaService.reservationRead.count({
      where: getReservationsByParkingIdQueryWhere(parkingId, search),
    });
  }
}
