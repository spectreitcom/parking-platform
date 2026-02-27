import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteParkingAddonCommand } from '../commands/delete-parking-addon.command';
import { ParkingAddonRepository } from '../ports/parking-addon.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(DeleteParkingAddonCommand)
export class DeleteParkingAddonCommandHandler implements ICommandHandler<
  DeleteParkingAddonCommand,
  void
> {
  constructor(
    private readonly parkingAddonRepository: ParkingAddonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteParkingAddonCommand): Promise<void> {
    const { id } = command;

    const parkingAddon = await this.parkingAddonRepository.findById(id);

    if (!parkingAddon) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking addon with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingAddon);
    parkingAddon.delete();

    await this.parkingAddonRepository.delete(id);
    parkingAddon.commit();
  }
}
