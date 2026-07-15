import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CompleteReservationCommand } from '../commands/complete-reservation.command';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { AppError, ConcurrencyError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { CompletingReservationError } from 'src/modules/reservation/domain/errors';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCompletedV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OutboxService } from 'src/shared/outbox/outbox.service';

@CommandHandler(CompleteReservationCommand)
export class CompleteReservationCommandHandler implements ICommandHandler<
  CompleteReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: CompleteReservationCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { reservationId, version } = command;

      const reservation = await this.reservationRepository.findById(
        reservationId,
        prisma,
      );

      if (!reservation) {
        throw new AppError('ENTITY_NOT_FOUND', 'Reservation not found');
      }

      const _version = AggregateVersion.fromNumber(version);

      if (!reservation.getVersion().equals(_version)) {
        throw new AppError(
          'CONCURRENCY',
          `Reservation with id ${reservationId} has been modified by another process`,
        );
      }

      this.eventPublisher.mergeObjectContext(reservation);

      try {
        reservation.complete();
        await this.reservationRepository.save(reservation, { tx: prisma });

        const event = new IntegrationEvent<
          ReservationCompletedV1Payload,
          ReservationIntegrationEventTypes
        >(
          'reservation.reservation.completed.v1',
          {
            reservationId: reservation.getId().value,
            parkingSpotId: reservation.getParkingSpotId().value,
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
      } catch (e) {
        if (e instanceof ConcurrencyError) {
          throw new AppError('CONCURRENCY', e.message);
        }
        if (e instanceof CompletingReservationError) {
          throw new AppError(
            'SIMPLE_ERROR',
            'Error during completing reservation',
          );
        }
        throw e;
      }
    });
  }
}
