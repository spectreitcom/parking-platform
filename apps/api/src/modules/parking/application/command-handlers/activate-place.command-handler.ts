import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivatePlaceCommand } from '../commands/activate-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';

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
    const { id, version } = command;

    const place = await this.placeRepository.findById(id);

    if (!place) {
      throw new AppError('ENTITY_NOT_FOUND', `Place with id ${id} not found`);
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!place.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Place with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(place);
    place.activate();

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
