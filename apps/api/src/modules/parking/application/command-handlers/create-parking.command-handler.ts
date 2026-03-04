import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingCommand } from '../commands/create-parking.command';
import { ParkingRepository } from '../ports/parking.repository';
import { Parking } from '../../domain/parking';

@CommandHandler(CreateParkingCommand)
export class CreateParkingCommandHandler implements ICommandHandler<
  CreateParkingCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateParkingCommand): Promise<string> {
    const { ownerId, name, address, longitude, latitude, placeId } = command;

    const parking = this.eventPublisher.mergeObjectContext(
      Parking.create(ownerId, name, address, { longitude, latitude }, placeId),
    );

    await this.parkingRepository.save(parking, { isNew: true });
    parking.commit();

    return parking.getId().value;
  }
}
