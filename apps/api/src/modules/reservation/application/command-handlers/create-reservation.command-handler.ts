import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateReservationCommand } from '../commands/create-reservation.command';
import { ReservationRepository } from '../ports/reservation.repository';
import { Reservation } from '../../domain/reservation';

@CommandHandler(CreateReservationCommand)
export class CreateReservationCommandHandler implements ICommandHandler<
  CreateReservationCommand,
  string
> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateReservationCommand): Promise<string> {
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

    await this.reservationRepository.save(reservation, { isNew: true });
    reservation.commit();

    return reservation.getId().value;
  }
}
