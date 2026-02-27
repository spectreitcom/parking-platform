import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingAddonCommand } from '../commands/update-parking-addon.command';
import { ParkingAddonRepository } from '../ports/parking-addon.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(UpdateParkingAddonCommand)
export class UpdateParkingAddonCommandHandler implements ICommandHandler<
  UpdateParkingAddonCommand,
  void
> {
  constructor(
    private readonly parkingAddonRepository: ParkingAddonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingAddonCommand): Promise<void> {
    const { id, name, price } = command;

    const parkingAddon = await this.parkingAddonRepository.findById(id);

    if (!parkingAddon) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking addon with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingAddon);
    parkingAddon.update(name, price);

    await this.parkingAddonRepository.save(parkingAddon);
    parkingAddon.commit();
  }
}
