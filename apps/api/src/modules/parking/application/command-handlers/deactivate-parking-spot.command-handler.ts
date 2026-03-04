import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateParkingSpotCommand } from '../commands/deactivate-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(DeactivateParkingSpotCommand)
export class DeactivateParkingSpotCommandHandler implements ICommandHandler<
  DeactivateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeactivateParkingSpotCommand): Promise<string> {
    const { id, version } = command;

    const parkingSpot = await this.parkingSpotRepository.findById(id);

    if (!parkingSpot) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking spot with id ${id} not found`,
      );
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!parkingSpot.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking spot with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingSpot);
    parkingSpot.deactivate();

    await this.parkingSpotRepository.save(parkingSpot);
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
