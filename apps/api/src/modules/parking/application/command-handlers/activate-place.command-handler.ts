import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivatePlaceCommand } from '../commands/activate-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(ActivatePlaceCommand)
export class ActivatePlaceCommandHandler implements ICommandHandler<
  ActivatePlaceCommand,
  string
> {
  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ActivatePlaceCommand): Promise<string> {
    const { id } = command;

    const place = await this.placeRepository.findById(id);

    if (!place) {
      throw new AppError('ENTITY_NOT_FOUND', `Place with id ${id} not found`);
    }

    this.eventPublisher.mergeObjectContext(place);
    place.activate();

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
