import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlaceTypeCommand } from '../commands/create-place-type.command';
import { PlaceTypeRepository } from '../ports/place-type.repository';
import { PlaceType } from '../../domain/place-type';
import { AppError, UniqueConstraintError } from 'src/shared/errors';

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
    try {
      const { name } = command;

      const placeType = this.eventPublisher.mergeObjectContext(
        PlaceType.create(name),
      );

      await this.placeTypeRepository.save(placeType, { isNew: true });
      placeType.commit();

      return placeType.getId().value;
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Place type with the same name already exists',
        );
      }
      throw e;
    }
  }
}
