import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePlaceCommand } from '../commands/update-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(UpdatePlaceCommand)
export class UpdatePlaceCommandHandler implements ICommandHandler<
  UpdatePlaceCommand,
  string
> {
  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdatePlaceCommand): Promise<string> {
    const { id, name, latitude, longitude, placeTypeId, address } = command;

    const place = await this.placeRepository.findById(id);

    if (!place) {
      throw new AppError('ENTITY_NOT_FOUND', `Place with id ${id} not found`);
    }

    this.eventPublisher.mergeObjectContext(place);
    place.update(name, { latitude, longitude }, address, placeTypeId);

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
