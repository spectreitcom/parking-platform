import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreatePlaceCommandHandler } from '../create-place.command-handler';
import { CreatePlaceCommand } from '../../commands/create-place.command';
import { PlaceRepository } from '../../ports/place.repository';
import { Place } from '../../../domain/place';
import { randomUUID } from 'node:crypto';

describe('CreatePlaceCommandHandler', () => {
  let handler: CreatePlaceCommandHandler;
  let repository: jest.Mocked<PlaceRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePlaceCommandHandler,
        {
          provide: PlaceRepository,
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

    handler = module.get<CreatePlaceCommandHandler>(CreatePlaceCommandHandler);
    repository = module.get(PlaceRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new place', async () => {
    const command = new CreatePlaceCommand(
      'Parking Place 1',
      52.2297,
      21.0122,
      randomUUID(),
      true,
      'Main Street 1',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');

    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(
      expect.any(Place),
    );
    expect(repository.save).toHaveBeenCalledWith(
      expect.any(Place),
      expect.objectContaining({ isNew: true }),
    );

    const savedPlace = repository.save.mock.calls[0][0];
    expect(savedPlace.getName().value).toBe(command.name);
    expect(savedPlace.getCoords().latitude).toBe(command.latitude);
    expect(savedPlace.getCoords().longitude).toBe(command.longitude);
    expect(savedPlace.getAddress().value).toBe(command.address);
    expect(savedPlace.isActive()).toBe(command.active);
    expect(savedPlace.getPlaceTypeId().value).toBe(command.placeTypeId);
  });
});
