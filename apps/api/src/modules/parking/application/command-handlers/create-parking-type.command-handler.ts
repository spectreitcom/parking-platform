import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingTypeCommand } from '../commands/create-parking-type.command';
import { ParkingTypeRepository } from '../ports/parking-type.repository';
import { ParkingType } from '../../domain/parking-type';

@CommandHandler(CreateParkingTypeCommand)
export class CreateParkingTypeCommandHandler implements ICommandHandler<
  CreateParkingTypeCommand,
  string
> {
  constructor(
    private readonly parkingTypeRepository: ParkingTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateParkingTypeCommand): Promise<string> {
    const { name } = command;

    const parkingType = this.eventPublisher.mergeObjectContext(
      ParkingType.create(name),
    );

    await this.parkingTypeRepository.save(parkingType);
    parkingType.commit();

    return parkingType.getId().value;
  }
}
