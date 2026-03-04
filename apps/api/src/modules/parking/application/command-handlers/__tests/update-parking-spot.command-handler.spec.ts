import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingSpotCommandHandler } from '../update-parking-spot.command-handler';
import { UpdateParkingSpotCommand } from '../../commands/update-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('UpdateParkingSpotCommandHandler', () => {
  let handler: UpdateParkingSpotCommandHandler;
  let repository: jest.Mocked<ParkingSpotRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingSpotCommandHandler,
        {
          provide: ParkingSpotRepository,
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

    handler = module.get<UpdateParkingSpotCommandHandler>(
      UpdateParkingSpotCommandHandler,
    );
    repository = module.get(ParkingSpotRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing parking spot', async () => {
    const id = randomUUID();
    const parkingSpot = ParkingSpot.create(randomUUID(), 10, []);
    repository.findById.mockResolvedValue(parkingSpot);

    const command = new UpdateParkingSpotCommand(
      id,
      20,
      [randomUUID()],
      parkingSpot.getVersion().value,
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parkingSpot);
    expect(repository.save).toHaveBeenCalledWith(parkingSpot);
    /* eslint-enable @typescript-eslint/unbound-method */
    expect(parkingSpot.getPrice().value).toBe(command.price);
    expect(parkingSpot.getParkingSpotFeatureIds().map((f) => f.value)).toEqual(
      command.parkingSpotFeatureIds,
    );
  });

  it('should throw error if parking spot not found', async () => {
    const id = randomUUID();
    repository.findById.mockResolvedValue(null);

    const command = new UpdateParkingSpotCommand(id, 20, [], 1);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
  });

  it('should throw AppError if version is invalid', async () => {
    const id = randomUUID();
    const parkingSpot = ParkingSpot.create(randomUUID(), 10, []);
    repository.findById.mockResolvedValue(parkingSpot);

    const command = new UpdateParkingSpotCommand(id, 20, [], -1);

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });
});
