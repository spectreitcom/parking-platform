import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingSpotCommand } from '../commands/create-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { ParkingSpot } from '../../domain/parking-spot';

@CommandHandler(CreateParkingSpotCommand)
export class CreateParkingSpotCommandHandler implements ICommandHandler<
  CreateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateParkingSpotCommand): Promise<string> {
    const { parkingId, price, parkingSpotFeatureIds } = command;

    const parkingSpot = this.eventPublisher.mergeObjectContext(
      ParkingSpot.create(parkingId, price, parkingSpotFeatureIds),
    );

    await this.parkingSpotRepository.save(parkingSpot);
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
