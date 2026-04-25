import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserReservationsListTotalQuery } from '../queries/get-user-reservations-list-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getUserReservationsListQueryWhere } from './get-user-reservations-list.query-handler';

@QueryHandler(GetUserReservationsListTotalQuery)
export class GetUserReservationsListTotalQueryHandler implements IQueryHandler<
  GetUserReservationsListTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetUserReservationsListTotalQuery): Promise<number> {
    const { userId, search } = query;

    return this.prismaService.reservationRead.count({
      where: getUserReservationsListQueryWhere(userId, search),
    });
  }
}
