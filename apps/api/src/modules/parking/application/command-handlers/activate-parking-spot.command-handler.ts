import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivateParkingSpotCommand } from '../commands/activate-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(ActivateParkingSpotCommand)
export class ActivateParkingSpotCommandHandler implements ICommandHandler<
  ActivateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ActivateParkingSpotCommand): Promise<string> {
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
    parkingSpot.activate();

    await this.parkingSpotRepository.save(parkingSpot);
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
