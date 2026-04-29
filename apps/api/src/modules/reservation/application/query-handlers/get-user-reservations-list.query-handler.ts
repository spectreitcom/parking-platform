import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserReservationsListQuery } from '../queries/get-user-reservations-list.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getReservationsListQueryWhere } from './get-reservations-list.query-handler';
import { UserReservationListItemReadModel } from './read-models/user-reservation-list-item.read-model';
import { CancellationService } from '../../domain/services/cancellation.service';
import { ReservationDateRange } from '../../domain/value-objects/reservation-date-range';
import { ReservationStatus } from '../../domain/value-objects/reservation-status';
import { ReservationAddon } from '../../domain/value-objects/reservation-addon';
import { UpdatingService } from '../../domain/services/updating.service';

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
  UserReservationListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetUserReservationsListQuery,
  ): Promise<UserReservationListItemReadModel[]> {
    const { userId, search, page, limit } = query;

    const records = await this.prismaService.reservationRead.findMany({
      where: getUserReservationsListQueryWhere(userId, search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { reservationId: 'desc' }],
    });

    return records.map(
      (record) =>
        new UserReservationListItemReadModel(
          record.reservationId,
          record.registrationNumber,
          record.parkingSpotId,
          record.status,
          record.createdAt,
          record.updatedAt,
          new Date(record.arrival),
          new Date(record.departure),
          record.version,
          CancellationService.canCancel(
            ReservationDateRange.fromValues(record.arrival, record.departure),
            ReservationStatus.fromString(record.status),
            record.addons.map((addon) => ReservationAddon.fromString(addon)),
          ),
          UpdatingService.canUpdate(
            ReservationStatus.fromString(record.status),
          ),
          record.parkingId,
        ),
    );
  }
}
