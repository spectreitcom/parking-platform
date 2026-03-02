import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingAddonCommand } from '../commands/update-parking-addon.command';
import { ParkingAddonRepository } from '../ports/parking-addon.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(UpdateParkingAddonCommand)
export class UpdateParkingAddonCommandHandler implements ICommandHandler<
  UpdateParkingAddonCommand,
  string
> {
  constructor(
    private readonly parkingAddonRepository: ParkingAddonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingAddonCommand): Promise<string> {
    const { id, name, price, version } = command;

    const parkingAddon = await this.parkingAddonRepository.findById(id);

    if (!parkingAddon) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking addon with id ${id} not found`,
      );
    }

    let _version: AggregateVersion;
    try {
      _version = AggregateVersion.fromNumber(version);
    } catch (error) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Invalid version: ${version}. ${error instanceof Error ? error.message : ''}`,
      );
    }

    if (!parkingAddon.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking addon with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingAddon);
    parkingAddon.update(name, price);

    await this.parkingAddonRepository.save(parkingAddon);
    parkingAddon.commit();

    return parkingAddon.getId().value;
  }
}
