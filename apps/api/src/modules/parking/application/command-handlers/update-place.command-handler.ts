import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePlaceCommand } from '../commands/update-place.command';
import { PlaceRepository } from '../ports/place.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

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
    const { id, name, latitude, longitude, placeTypeId, address, version } =
      command;

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
    place.update(name, { latitude, longitude }, address, placeTypeId);

    await this.placeRepository.save(place);
    place.commit();

    return place.getId().value;
  }
}
