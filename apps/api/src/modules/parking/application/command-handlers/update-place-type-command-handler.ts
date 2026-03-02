import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePlaceTypeCommand } from '../commands/update-place-type.command';
import { PlaceTypeRepository } from '../ports/place-type.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(UpdatePlaceTypeCommand)
export class UpdatePlaceTypeCommandHandler implements ICommandHandler<
  UpdatePlaceTypeCommand,
  string
> {
  constructor(
    private readonly placeTypeRepository: PlaceTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdatePlaceTypeCommand): Promise<string> {
    const { id, name } = command;

    const placeType = await this.placeTypeRepository.findById(id);

    if (!placeType) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Place type with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(placeType);
    placeType.update(name);

    await this.placeTypeRepository.save(placeType);
    placeType.commit();

    return placeType.getId().value;
  }
}
