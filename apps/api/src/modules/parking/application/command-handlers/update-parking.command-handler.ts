import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingCommand } from '../commands/update-parking.command';
import { ParkingRepository } from '../ports/parking.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';

@CommandHandler(UpdateParkingCommand)
export class UpdateParkingCommandHandler implements ICommandHandler<
  UpdateParkingCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingCommand): Promise<string> {
    const {
      id,
      name,
      address,
      longitude,
      latitude,
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      description,
      statute,
      version,
      placeId,
      organizationId,
    } = command;

    const parking = await this.parkingRepository.findById(id);

    if (!parking) {
      throw new AppError('ENTITY_NOT_FOUND', `Parking with id ${id} not found`);
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!parking.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parking);
    parking.update(
      name,
      address,
      { longitude, latitude },
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      placeId,
      organizationId,
      description,
      statute,
    );

    await this.parkingRepository.save(parking);
    parking.commit();

    return parking.getId().value;
  }
}
