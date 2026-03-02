import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeletePlaceTypeCommandHandler } from '../delete-place-type-command-handler';
import { DeletePlaceTypeCommand } from '../../commands/delete-place-type.command';
import { PlaceTypeRepository } from '../../ports/place-type.repository';
import { PlaceType } from '../../../domain/place-type';
import { AppError } from '../../../../../shared/errors';

describe('DeletePlaceTypeCommandHandler', () => {
  let handler: DeletePlaceTypeCommandHandler;
  let repository: jest.Mocked<PlaceTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePlaceTypeCommandHandler,
        {
          provide: PlaceTypeRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    handler = module.get<DeletePlaceTypeCommandHandler>(
      DeletePlaceTypeCommandHandler,
    );
    repository = module.get(PlaceTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should delete an existing place type', async () => {
    const placeType = PlaceType.create('Standard');
    const id = placeType.getId().value;
    repository.findById.mockResolvedValue(placeType);
    const command = new DeletePlaceTypeCommand(id);

    const result = await handler.execute(command);

    expect(result).toBe(id);
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(placeType);
    expect(repository.delete).toHaveBeenCalledWith(id);
    /* eslint-enable @typescript-eslint/unbound-method */
  });

  it('should throw AppError if place type not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new DeletePlaceTypeCommand('non-existent');

    const exec = handler.execute(command);
    await expect(exec).rejects.toThrow(AppError);
    await expect(exec).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });
});
