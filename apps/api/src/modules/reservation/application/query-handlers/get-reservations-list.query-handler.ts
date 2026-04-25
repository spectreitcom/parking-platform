import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsListQuery } from '../queries/get-reservations-list.query';
import { ReservationListItemReadModel } from 'src/modules/reservation/application/query-handlers/read-models/reservation-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getReservationsListQueryWhere: (
  search?: string,
) => Prisma.ReservationReadWhereInput = (search?: string) =>
  search
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
    : {};

@QueryHandler(GetReservationsListQuery)
export class GetReservationsListQueryHandler implements IQueryHandler<
  GetReservationsListQuery,
  ReservationListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetReservationsListQuery,
  ): Promise<ReservationListItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.reservationRead.findMany({
      where: getReservationsListQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { reservationId: 'desc' }],
    });

    return records.map(
      (record) =>
        new ReservationListItemReadModel(
          record.reservationId,
          record.registrationNumber,
          record.status,
          record.createdAt,
          record.updatedAt,
          record.userId,
        ),
    );
  }
}
