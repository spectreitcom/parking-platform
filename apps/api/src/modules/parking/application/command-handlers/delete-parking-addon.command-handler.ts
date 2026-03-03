import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteParkingAddonCommand } from '../commands/delete-parking-addon.command';
import { ParkingAddonRepository } from '../ports/parking-addon.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(DeleteParkingAddonCommand)
export class DeleteParkingAddonCommandHandler implements ICommandHandler<
  DeleteParkingAddonCommand,
  string
> {
  constructor(
    private readonly parkingAddonRepository: ParkingAddonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteParkingAddonCommand): Promise<string> {
    const { id, version } = command;

    const parkingAddon = await this.parkingAddonRepository.findById(id);

    if (!parkingAddon) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking addon with id ${id} not found`,
      );
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!parkingAddon.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking addon with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingAddon);
    parkingAddon.delete();

    await this.parkingAddonRepository.delete(
      parkingAddon.getId().value,
      parkingAddon.getVersion().value,
    );
    parkingAddon.commit();
    return parkingAddon.getId().value;
  }
}
