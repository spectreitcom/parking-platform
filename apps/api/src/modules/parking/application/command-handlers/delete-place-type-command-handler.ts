import { DeletePlaceTypeCommand } from '../commands/delete-place-type.command';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PlaceTypeRepository } from '../ports/place-type.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(DeletePlaceTypeCommand)
export class DeletePlaceTypeCommandHandler implements ICommandHandler<
  DeletePlaceTypeCommand,
  string
> {
  constructor(
    private readonly placeTypeRepository: PlaceTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeletePlaceTypeCommand): Promise<string> {
    const { id } = command;

    const placeType = await this.placeTypeRepository.findById(id);

    if (!placeType) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Place type with id ${id} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(placeType);
    placeType.delete();

    await this.placeTypeRepository.delete(placeType.getId().value);
    placeType.commit();

    return placeType.getId().value;
  }
}
