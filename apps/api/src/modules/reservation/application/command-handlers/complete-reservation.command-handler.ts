import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CompleteReservationCommand } from '../commands/complete-reservation.command';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { AppError, ConcurrencyError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { CompletingReservationError } from 'src/modules/reservation/domain/errors';

@CommandHandler(CompleteReservationCommand)
export class CompleteReservationCommandHandler implements ICommandHandler<
  CompleteReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CompleteReservationCommand): Promise<string> {
    const { reservationId, version, userId } = command;

    const reservation = await this.reservationRepository.findByIdAndUserId(
      reservationId,
      userId,
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
      await this.reservationRepository.save(reservation);
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
  }
}
