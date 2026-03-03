import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingFeatureCommand } from '../commands/create-parking-feature.command';
import { ParkingFeatureRepository } from '../ports/parking-feature.repository';
import { ParkingFeature } from '../../domain/parking-feature';

@CommandHandler(CreateParkingFeatureCommand)
export class CreateParkingFeatureCommandHandler implements ICommandHandler<
  CreateParkingFeatureCommand,
  string
> {
  constructor(
    private readonly parkingFeatureRepository: ParkingFeatureRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateParkingFeatureCommand): Promise<string> {
    const { name, levels } = command;

    const parkingFeature = this.eventPublisher.mergeObjectContext(
      ParkingFeature.create(name, levels),
    );

    await this.parkingFeatureRepository.save(parkingFeature);
    parkingFeature.commit();

    return parkingFeature.getId().value;
  }
}
