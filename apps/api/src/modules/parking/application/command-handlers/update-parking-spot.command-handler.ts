import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingSpotCommand } from '../commands/update-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(UpdateParkingSpotCommand)
export class UpdateParkingSpotCommandHandler implements ICommandHandler<
  UpdateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingSpotCommand): Promise<string> {
    const { id, price, parkingSpotFeatureIds, version } = command;

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
    parkingSpot.update(price, parkingSpotFeatureIds);

    await this.parkingSpotRepository.save(parkingSpot);
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
