import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingFeatureCommand } from '../commands/update-parking-feature.command';
import { ParkingFeatureRepository } from '../ports/parking-feature.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(UpdateParkingFeatureCommand)
export class UpdateParkingFeatureCommandHandler implements ICommandHandler<
  UpdateParkingFeatureCommand,
  string
> {
  constructor(
    private readonly parkingFeatureRepository: ParkingFeatureRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingFeatureCommand): Promise<string> {
    const { id, name, levels, version } = command;

    const parkingFeature = await this.parkingFeatureRepository.findById(id);

    if (!parkingFeature) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking feature with id ${id} not found`,
      );
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!parkingFeature.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking feature with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingFeature);
    parkingFeature.update(name, levels);

    await this.parkingFeatureRepository.save(parkingFeature, { isNew: false });
    parkingFeature.commit();

    return parkingFeature.getId().value;
  }
}
