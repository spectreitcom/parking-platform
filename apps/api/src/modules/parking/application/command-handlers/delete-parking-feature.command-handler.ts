import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteParkingFeatureCommand } from '../commands/delete-parking-feature.command';
import { ParkingFeatureRepository } from '../ports/parking-feature.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(DeleteParkingFeatureCommand)
export class DeleteParkingFeatureCommandHandler implements ICommandHandler<
  DeleteParkingFeatureCommand,
  string
> {
  constructor(
    private readonly parkingFeatureRepository: ParkingFeatureRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteParkingFeatureCommand): Promise<string> {
    const { id, version } = command;

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
    parkingFeature.delete();

    await this.parkingFeatureRepository.delete(
      parkingFeature.getId().value,
      parkingFeature.getVersion().value,
    );
    parkingFeature.commit();

    return parkingFeature.getId().value;
  }
}
