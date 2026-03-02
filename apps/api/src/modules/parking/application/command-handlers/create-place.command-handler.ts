import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlaceCommand } from '../commands/create-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { Place } from '../../domain/place';

@CommandHandler(CreatePlaceCommand)
export class CreatePlaceCommandHandler implements ICommandHandler<
  CreatePlaceCommand,
  string
> {
  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreatePlaceCommand): Promise<string> {
    const { name, latitude, longitude, placeTypeId, active, address } = command;

    const place = this.eventPublisher.mergeObjectContext(
      Place.create(name, { latitude, longitude }, address, active, placeTypeId),
    );

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
