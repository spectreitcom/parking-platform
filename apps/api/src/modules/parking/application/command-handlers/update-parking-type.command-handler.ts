import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingTypeCommand } from '../commands/update-parking-type.command';
import { ParkingTypeRepository } from '../ports/parking-type.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(UpdateParkingTypeCommand)
export class UpdateParkingTypeCommandHandler implements ICommandHandler<
  UpdateParkingTypeCommand,
  string
> {
  constructor(
    private readonly parkingTypeRepository: ParkingTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateParkingTypeCommand): Promise<string> {
    const { id, name } = command;

    const parkingType = await this.parkingTypeRepository.findById(id);

    if (!parkingType) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking type with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingType);
    parkingType.update(name);

    await this.parkingTypeRepository.save(parkingType);
    parkingType.commit();

    return parkingType.getId().value;
  }
}
