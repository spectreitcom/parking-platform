import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdatePlaceCommandHandler } from '../update-place.command-handler';
import { UpdatePlaceCommand } from '../../commands/update-place.command';
import { PlaceRepository } from '../../ports/place.repository';
import { Place } from '../../../domain/place';
import { randomUUID } from 'node:crypto';
import { AppError } from 'src/shared/errors';

describe('UpdatePlaceCommandHandler', () => {
  let handler: UpdatePlaceCommandHandler;
  let repository: jest.Mocked<PlaceRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePlaceCommandHandler,
        {
          provide: PlaceRepository,
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

    handler = module.get<UpdatePlaceCommandHandler>(UpdatePlaceCommandHandler);
    repository = module.get(PlaceRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing place', async () => {
    const id = randomUUID();
    const place = Place.create(
      'Old Name',
      { latitude: 52.0, longitude: 21.0 },
      'Old Address',
      randomUUID(),
    );
    repository.findById.mockResolvedValue(place);

    const command = new UpdatePlaceCommand(
      id,
      'New Name',
      53.0,
      22.0,
      randomUUID(),
      'New Address',
      place.getVersion().value,
    );

    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(place);
    expect(repository.save).toHaveBeenCalledWith(place);

    expect(place.getName().value).toBe('New Name');
    expect(place.getCoords().latitude).toBe(53.0);
    expect(place.getCoords().longitude).toBe(22.0);
    expect(place.getAddress().value).toBe('New Address');
  });

  it('should throw error if place not found', async () => {
    const id = randomUUID();
    repository.findById.mockResolvedValue(null);

    const command = new UpdatePlaceCommand(
      id,
      'New Name',
      53.0,
      22.0,
      randomUUID(),
      'New Address',
      1,
    );

    await expect(handler.execute(command)).rejects.toThrow(AppError);
  });

  it('should throw AppError if version is invalid', async () => {
    const id = randomUUID();
    const place = Place.create(
      'Name',
      { latitude: 52.0, longitude: 21.0 },
      'Address',
      randomUUID(),
    );
    repository.findById.mockResolvedValue(place);

    const command = new UpdatePlaceCommand(
      id,
      'New Name',
      53.0,
      22.0,
      randomUUID(),
      'New Address',
      -1, // Invalid version
    );

    try {
      await handler.execute(command);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION_ERROR');
    }
  });
});
