import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserReservationsListQuery } from '../queries/get-user-reservations-list.query';
import { ReservationListItemReadModel } from './read-models/reservation-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getReservationsListQueryWhere } from './get-reservations-list.query-handler';

export const getUserReservationsListQueryWhere: (
  userId: string,
  search?: string,
) => Prisma.ReservationReadWhereInput = (userId: string, search?: string) => ({
  userId,
  ...getReservationsListQueryWhere(search),
});

@QueryHandler(GetUserReservationsListQuery)
export class GetUserReservationsListQueryHandler implements IQueryHandler<
  GetUserReservationsListQuery,
  ReservationListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetUserReservationsListQuery,
  ): Promise<ReservationListItemReadModel[]> {
    const { userId, search, page, limit } = query;

    const records = await this.prismaService.reservationRead.findMany({
      where: getUserReservationsListQueryWhere(userId, search),
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
