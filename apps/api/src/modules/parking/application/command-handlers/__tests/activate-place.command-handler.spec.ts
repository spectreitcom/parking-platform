import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { ActivatePlaceCommandHandler } from '../activate-place.command-handler';
import { ActivatePlaceCommand } from '../../commands/activate-place.command';
import { PlaceRepository } from '../../ports/place.repository';
import { Place } from '../../../domain/place';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('ActivatePlaceCommandHandler', () => {
  let handler: ActivatePlaceCommandHandler;
  let repository: jest.Mocked<PlaceRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivatePlaceCommandHandler,
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

    handler = module.get<ActivatePlaceCommandHandler>(
      ActivatePlaceCommandHandler,
    );
    repository = module.get(PlaceRepository);
    publisher = module.get(EventPublisher);
  });

  it('should activate and save an existing place', async () => {
    const id = randomUUID();
    const place = Place.create(
      'Place 1',
      { latitude: 52.0, longitude: 21.0 },
      'Address 1',
      false,
      randomUUID(),
    );
    repository.findById.mockResolvedValue(place);

    const command = new ActivatePlaceCommand(id, place.getVersion().value);

    const result = await handler.execute(command);

    expect(result).toBeDefined();

    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(place);
    expect(repository.save).toHaveBeenCalledWith(place);

    expect(place.isActive()).toBe(true);
  });

  it('should throw error if place not found', async () => {
    const id = randomUUID();
    repository.findById.mockResolvedValue(null);

    const command = new ActivatePlaceCommand(id, 1);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
  });

  it('should throw AppError if version is invalid', async () => {
    const id = randomUUID();
    const place = Place.create(
      'Place 1',
      { latitude: 52.0, longitude: 21.0 },
      'Address 1',
      false,
      randomUUID(),
    );
    repository.findById.mockResolvedValue(place);

    const command = new ActivatePlaceCommand(id, -1);

    try {
      await handler.execute(command);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION_ERROR');
    }
  });
});
