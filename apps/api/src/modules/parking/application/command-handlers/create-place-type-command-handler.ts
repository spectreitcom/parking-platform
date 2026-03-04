import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlaceTypeCommand } from '../commands/create-place-type.command';
import { PlaceTypeRepository } from '../ports/place-type.repository';
import { PlaceType } from '../../domain/place-type';

@CommandHandler(CreatePlaceTypeCommand)
export class CreatePlaceTypeCommandHandler implements ICommandHandler<
  CreatePlaceTypeCommand,
  string
> {
  constructor(
    private readonly placeTypeRepository: PlaceTypeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreatePlaceTypeCommand): Promise<string> {
    const { name } = command;

    const placeType = this.eventPublisher.mergeObjectContext(
      PlaceType.create(name),
    );

    await this.placeTypeRepository.save(placeType, { isNew: true });
    placeType.commit();

    return placeType.getId().value;
  }
}
