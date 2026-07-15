import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsByParkingIdQuery } from '../queries/get-reservations-by-parking-id.query';
import { ReservationReadModel } from 'src/modules/reservation/application/query-handlers/read-models/reservation.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getReservationsByParkingIdQueryWhere: (
  parkingId: string,
  search?: string,
) => Prisma.ReservationReadWhereInput = (
  parkingId: string,
  search?: string,
) => ({
  parkingId,
  ...(search
    ? {
        OR: [
          {
            registrationNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {}),
});

@QueryHandler(GetReservationsByParkingIdQuery)
export class GetReservationsByParkingIdQueryHandler implements IQueryHandler<
  GetReservationsByParkingIdQuery,
  ReservationReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetReservationsByParkingIdQuery,
  ): Promise<ReservationReadModel[]> {
    const { parkingId, search, page, limit } = query;

    const records = await this.prismaService.reservationRead.findMany({
      where: getReservationsByParkingIdQueryWhere(parkingId, search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { reservationId: 'desc' }],
    });

    return records.map(
      (record) =>
        new ReservationReadModel(
          record.reservationId,
          record.cartId,
          record.parkingSpotId,
          record.parkingId,
          record.userId,
          record.arrival * 1000,
          record.departure * 1000,
          record.lines as { title: string; price: number }[],
          record.total,
          record.status,
          record.registrationNumber,
          record.version,
          record.createdAt,
          record.updatedAt,
        ),
    );
  }
}
