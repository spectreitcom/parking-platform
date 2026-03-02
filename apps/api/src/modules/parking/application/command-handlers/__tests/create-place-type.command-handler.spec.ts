import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreatePlaceTypeCommandHandler } from '../create-place-type-command-handler';
import { CreatePlaceTypeCommand } from '../../commands/create-place-type.command';
import { PlaceTypeRepository } from '../../ports/place-type.repository';
import { PlaceType } from '../../../domain/place-type';

describe('CreatePlaceTypeCommandHandler', () => {
  let handler: CreatePlaceTypeCommandHandler;
  let repository: jest.Mocked<PlaceTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePlaceTypeCommandHandler,
        {
          provide: PlaceTypeRepository,
          useValue: {
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

    handler = module.get<CreatePlaceTypeCommandHandler>(
      CreatePlaceTypeCommandHandler,
    );
    repository = module.get(PlaceTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new place type', async () => {
    const command = new CreatePlaceTypeCommand('Standard');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(
      expect.any(PlaceType),
    );
    expect(repository.save).toHaveBeenCalledWith(expect.any(PlaceType));
    /* eslint-enable @typescript-eslint/unbound-method */
    const savedPlaceType = repository.save.mock.calls[0][0];
    expect(savedPlaceType.getName().value).toBe('Standard');
  });
});
