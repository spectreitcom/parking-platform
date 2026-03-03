import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePlaceTypeCommand } from '../commands/update-place-type.command';
import { PlaceTypeRepository } from '../ports/place-type.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

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
    const { id, name, version } = command;

    const placeType = await this.placeTypeRepository.findById(id);

    if (!placeType) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Place type with id ${id} not found`,
      );
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!placeType.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Place type with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(placeType);
    placeType.update(name);

    await this.placeTypeRepository.save(placeType);
    placeType.commit();

    return placeType.getId().value;
  }
}
