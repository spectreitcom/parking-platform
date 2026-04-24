import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelReservationCommand } from '../commands/cancel-reservation.command';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { CancellingReservationError } from 'src/modules/reservation/domain/errors';

@CommandHandler(CancelReservationCommand)
export class CancelReservationCommandHandler implements ICommandHandler<
  CancelReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CancelReservationCommand): Promise<string> {
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
      reservation.cancel();
      await this.reservationRepository.save(reservation);
      reservation.commit();
      return reservation.getId().value;
    } catch (e) {
      if (e instanceof CancellingReservationError) {
        throw new AppError(
          'SIMPLE_ERROR',
          'Error during cancelling reservation',
        );
      }
      throw e;
    }
  }
}
