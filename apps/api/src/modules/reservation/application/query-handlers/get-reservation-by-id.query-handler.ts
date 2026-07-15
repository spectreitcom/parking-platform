import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationByIdQuery } from '../queries/get-reservation-by-id.query';
import { ReservationReadModel } from './read-models/reservation.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetReservationByIdQuery)
export class GetReservationByIdQueryHandler implements IQueryHandler<
  GetReservationByIdQuery,
  ReservationReadModel | null
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetReservationByIdQuery,
  ): Promise<ReservationReadModel | null> {
    const { reservationId } = query;

    const reservation = await this.prismaService.reservationRead.findUnique({
      where: {
        reservationId,
      },
    });

    if (!reservation) {
      return null;
    }

    return new ReservationReadModel(
      reservation.reservationId,
      reservation.cartId,
      reservation.parkingSpotId,
      reservation.parkingId,
      reservation.userId,
      reservation.arrival * 1000,
      reservation.departure * 1000,
      reservation.lines as { title: string; price: number }[],
      reservation.total,
      reservation.status,
      reservation.registrationNumber,
      reservation.version,
      reservation.createdAt,
      reservation.updatedAt,
    );
  }
}
