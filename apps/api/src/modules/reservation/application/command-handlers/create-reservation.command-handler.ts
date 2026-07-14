import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateReservationCommand } from '../commands/create-reservation.command';
import { ReservationRepository } from '../ports/reservation.repository';
import { Reservation } from '../../domain/reservation';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCreatedV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';

@CommandHandler(CreateReservationCommand)
export class CreateReservationCommandHandler implements ICommandHandler<
  CreateReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: CreateReservationCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const {
        registrationNumber,
        userId,
        lines,
        parkingSpotId,
        endDate,
        startDate,
        cartId,
        addons,
        parkingId,
      } = command;

      const reservation = Reservation.create(
        cartId,
        parkingId,
        parkingSpotId,
        userId,
        startDate,
        endDate,
        lines,
        registrationNumber,
        addons,
      );

      this.eventPublisher.mergeObjectContext(reservation);

      await this.reservationRepository.save(reservation, {
        isNew: true,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        ReservationCreatedV1Payload,
        ReservationIntegrationEventTypes
      >(
        'reservation.reservation.created.v1',
        {
          reservationId: reservation.getId().value,
          parkingSpotId: reservation.getParkingSpotId().value,
          userId: reservation.getUserId().value,
          amount: reservation.getTotal().value,
        },
        'reservation',
        'Reservation',
        reservation.getId().value,
      );

      await this.outboxService.enqueue(
        event,
        {
          deduplicate: true,
        },
        prisma,
      );

      reservation.commit();

      return reservation.getId().value;
    });
  }
}
