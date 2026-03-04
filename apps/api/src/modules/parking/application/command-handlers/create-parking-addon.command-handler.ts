import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingAddonCommand } from '../commands/create-parking-addon.command';
import { ParkingAddonRepository } from '../ports/parking-addon.repository';
import { AppError } from '../../../../shared/errors';
import { ParkingAddon } from '../../domain/parking-addon';

@CommandHandler(CreateParkingAddonCommand)
export class CreateParkingAddonCommandHandler implements ICommandHandler<
  CreateParkingAddonCommand,
  string
> {
  constructor(
    private readonly parkingAddonRepository: ParkingAddonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateParkingAddonCommand): Promise<string> {
    const { code, name, price } = command;

    const record = await this.parkingAddonRepository.findByCode(code);

    if (record) {
      throw new AppError(
        'ALREADY_EXISTS',
        `Parking addon with code ${code} already exists`,
      );
    }

    const parkingAddon = this.eventPublisher.mergeObjectContext(
      ParkingAddon.create(code, name, price),
    );

    await this.parkingAddonRepository.save(parkingAddon, { isNew: true });
    parkingAddon.commit();

    return parkingAddon.getId().value;
  }
}
