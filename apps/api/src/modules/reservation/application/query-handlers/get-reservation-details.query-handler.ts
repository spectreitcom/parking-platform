import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationDetailsQuery } from '../queries/get-reservation-details.query';
import { ReservationReadModel } from './read-models/reservation.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetReservationDetailsQuery)
export class GetReservationDetailsQueryHandler implements IQueryHandler<
  GetReservationDetailsQuery,
  ReservationReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetReservationDetailsQuery,
  ): Promise<ReservationReadModel> {
    const { reservationId, userId } = query;

    const reservation = await this.prismaService.reservationRead.findUnique({
      where: {
        reservationId,
      },
    });

    if (!reservation || reservation.userId !== userId) {
      throw new AppError('ENTITY_NOT_FOUND', 'Reservation not found');
    }

    return new ReservationReadModel(
      reservation.reservationId,
      reservation.cartId,
      reservation.parkingSpotId,
      reservation.parkingId,
      reservation.userId,
      reservation.arrival,
      reservation.departure,
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
