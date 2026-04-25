import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateReservationCommand } from './commands/create-reservation.command';
import { UpdateReservationCommand } from './commands/update-reservation.command';
import { CancelReservationCommand } from './commands/cancel-reservation.command';
import { GetReservationsListQuery } from './queries/get-reservations-list.query';
import { GetReservationsListTotalQuery } from './queries/get-reservations-list-total.query';
import { GetUserReservationsListQuery } from './queries/get-user-reservations-list.query';
import { GetUserReservationsListTotalQuery } from './queries/get-user-reservations-list-total.query';
import { ReservationListItemReadModel } from './query-handlers/read-models/reservation-list-item.read-model';
import { CompleteReservationCommand } from './commands/complete-reservation.command';

@Injectable()
export class ReservationFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createReservation(
    cartId: string,
    userId: string,
    parkingSpotId: string,
    startDate: number,
    endDate: number,
    registrationNumber: string,
    lines: { title: string; price: number }[],
    addons: string[],
  ): Promise<string> {
    return await this.commandBus.execute<CreateReservationCommand, string>(
      new CreateReservationCommand(
        cartId,
        userId,
        parkingSpotId,
        startDate,
        endDate,
        registrationNumber,
        lines,
        addons,
      ),
    );
  }

  async updateReservation(
    reservationId: string,
    userId: string,
    version: number,
    registrationNumber: string,
  ): Promise<string> {
    return await this.commandBus.execute<UpdateReservationCommand, string>(
      new UpdateReservationCommand(
        reservationId,
        userId,
        version,
        registrationNumber,
      ),
    );
  }

  async cancelReservation(
    reservationId: string,
    userId: string,
    version: number,
  ): Promise<string> {
    return await this.commandBus.execute<CancelReservationCommand, string>(
      new CancelReservationCommand(reservationId, userId, version),
    );
  }

  async completeReservation(
    reservationId: string,
    userId: string,
    version: number,
  ) {
    return await this.commandBus.execute<CompleteReservationCommand, string>(
      new CompleteReservationCommand(reservationId, userId, version),
    );
  }

  async getReservationsList(
    page: number,
    limit: number,
    search?: string,
  ): Promise<ReservationListItemReadModel[]> {
    return await this.queryBus.execute<
      GetReservationsListQuery,
      ReservationListItemReadModel[]
    >(new GetReservationsListQuery(page, limit, search));
  }

  async getReservationsListTotal(search?: string): Promise<number> {
    return await this.queryBus.execute<GetReservationsListTotalQuery, number>(
      new GetReservationsListTotalQuery(search),
    );
  }

  async getUserReservationsList(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<ReservationListItemReadModel[]> {
    return await this.queryBus.execute<
      GetUserReservationsListQuery,
      ReservationListItemReadModel[]
    >(new GetUserReservationsListQuery(userId, page, limit, search));
  }

  async getUserReservationsListTotal(
    userId: string,
    search?: string,
  ): Promise<number> {
    return await this.queryBus.execute<
      GetUserReservationsListTotalQuery,
      number
    >(new GetUserReservationsListTotalQuery(userId, search));
  }
}
