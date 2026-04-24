import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateReservationCommand } from '../commands/update-reservation.command';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { UpdateReservationError } from 'src/modules/reservation/domain/errors';

@CommandHandler(UpdateReservationCommand)
export class UpdateReservationCommandHandler implements ICommandHandler<
  UpdateReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateReservationCommand): Promise<string> {
    const { reservationId, version, userId, registrationNumber } = command;

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
      reservation.update(registrationNumber);
      await this.reservationRepository.save(reservation);
      reservation.commit();
      return reservation.getId().value;
    } catch (e) {
      if (e instanceof UpdateReservationError) {
        throw new AppError('SIMPLE_ERROR', 'Error during updating reservation');
      }
      throw e;
    }
  }
}
