import { DeleteParkingTypeCommand } from '../commands/delete-parking-type.command';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ParkingTypeRepository } from '../ports/parking-type.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(DeleteParkingTypeCommand)
export class DeleteParkingTypeCommandHandler implements ICommandHandler<
  DeleteParkingTypeCommand,
  string
> {
  constructor(
    private readonly parkingTypeRepository: ParkingTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteParkingTypeCommand): Promise<string> {
    const { id } = command;

    const parkingType = await this.parkingTypeRepository.findById(id);

    if (!parkingType) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking type with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(parkingType);
    parkingType.delete();

    await this.parkingTypeRepository.delete(parkingType.getId().value);
    parkingType.commit();

    return parkingType.getId().value;
  }
}
