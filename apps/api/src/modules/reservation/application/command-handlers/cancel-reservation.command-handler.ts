import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelReservationCommand } from '../commands/cancel-reservation.command';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { AppError, ConcurrencyError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { CancellingReservationError } from 'src/modules/reservation/domain/errors';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCancelledV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { OutboxService } from 'src/shared/outbox/outbox.service';

@CommandHandler(CancelReservationCommand)
export class CancelReservationCommandHandler implements ICommandHandler<
  CancelReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: CancelReservationCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { reservationId, version, userId } = command;

      const reservation = await this.reservationRepository.findByIdAndUserId(
        reservationId,
        userId,
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
        reservation.cancel();
        await this.reservationRepository.save(reservation, { tx: prisma });

        const event = new IntegrationEvent<
          ReservationCancelledV1Payload,
          ReservationIntegrationEventTypes
        >(
          'reservation.reservation.cancelled.v1',
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
        if (e instanceof CancellingReservationError) {
          throw new AppError(
            'SIMPLE_ERROR',
            'Error during cancelling reservation',
          );
        }
        throw e;
      }
    });
  }
}
