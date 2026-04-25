import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsListTotalQuery } from '../queries/get-reservations-list-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getReservationsListQueryWhere } from 'src/modules/reservation/application/query-handlers/get-reservations-list.query-handler';

@QueryHandler(GetReservationsListTotalQuery)
export class GetReservationsListTotalQueryHandler implements IQueryHandler<
  GetReservationsListTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetReservationsListTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.reservationRead.count({
      where: getReservationsListQueryWhere(search),
    });
  }
}
