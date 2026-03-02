import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeactivatePlaceCommand } from '../commands/deactivate-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(DeactivatePlaceCommand)
export class DeactivatePlaceCommandHandler implements ICommandHandler<
  DeactivatePlaceCommand,
  string
> {
  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeactivatePlaceCommand): Promise<string> {
    const { id, version } = command;

    const place = await this.placeRepository.findById(id);

    if (!place) {
      throw new AppError('ENTITY_NOT_FOUND', `Place with id ${id} not found`);
    }

    let _version: AggregateVersion;
    try {
      _version = AggregateVersion.fromNumber(version);
    } catch (error) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Invalid version: ${version}. ${error instanceof Error ? error.message : ''}`,
      );
    }

    if (!place.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Place with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(place);
    place.deactivate();

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
