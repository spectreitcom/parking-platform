import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingForManagerCommand } from '../commands/update-parking-for-manager.command';
import { ParkingRepository } from '../ports/parking.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';

@CommandHandler(UpdateParkingForManagerCommand)
export class UpdateParkingForManagerCommandHandler implements ICommandHandler<
  UpdateParkingForManagerCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingForManagerCommand): Promise<string> {
    const {
      id,
      name,
      parkingFeatureIds,
      parkingAddonIds,
      assetIds,
      version,
      statute,
      description,
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
      parking.getAddress().value,
      {
        longitude: parking.getCoords().longitude,
        latitude: parking.getCoords().latitude,
      },
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      parking.getPlaceId().value,
      parking.getOrganizationId().value,
      description,
      statute,
    );

    await this.parkingRepository.save(parking);
    parking.commit();

    return parking.getId().value;
  }
}
