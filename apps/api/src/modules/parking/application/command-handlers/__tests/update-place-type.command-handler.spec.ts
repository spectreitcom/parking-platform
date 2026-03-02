import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdatePlaceTypeCommandHandler } from '../update-place-type-command-handler';
import { UpdatePlaceTypeCommand } from '../../commands/update-place-type.command';
import { PlaceTypeRepository } from '../../ports/place-type.repository';
import { PlaceType } from '../../../domain/place-type';
import { AppError } from '../../../../../shared/errors';

describe('UpdatePlaceTypeCommandHandler', () => {
  let handler: UpdatePlaceTypeCommandHandler;
  let repository: jest.Mocked<PlaceTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePlaceTypeCommandHandler,
        {
          provide: PlaceTypeRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn(<T>(obj: T): T => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdatePlaceTypeCommandHandler>(
      UpdatePlaceTypeCommandHandler,
    );
    repository = module.get(PlaceTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing place type', async () => {
    const placeType = PlaceType.create('Standard');
    const id = placeType.getId().value;
    repository.findById.mockResolvedValue(placeType);
    const command = new UpdatePlaceTypeCommand(
      id,
      'Premium',
      placeType.getVersion().value,
    );

    const result = await handler.execute(command);

    expect(result).toBe(id);
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(placeType);
    expect(placeType.getName().value).toBe('Premium');
    expect(repository.save).toHaveBeenCalledWith(placeType);
    /* eslint-enable @typescript-eslint/unbound-method */
  });

  it('should throw AppError if place type not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new UpdatePlaceTypeCommand('non-existent', 'Premium', 1);

    const exec = handler.execute(command);

    await expect(exec).rejects.toThrow(AppError);
    await expect(exec).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });
});
