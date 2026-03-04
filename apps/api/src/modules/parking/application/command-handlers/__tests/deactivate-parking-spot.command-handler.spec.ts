import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeactivateParkingSpotCommandHandler } from '../deactivate-parking-spot.command-handler';
import { DeactivateParkingSpotCommand } from '../../commands/deactivate-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingRepository } from '../../ports/parking.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { Parking } from '../../../domain/parking';
import { OwnerId } from '../../../domain/value-objects/owner-id';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('DeactivateParkingSpotCommandHandler', () => {
  let handler: DeactivateParkingSpotCommandHandler;
  let repository: jest.Mocked<ParkingSpotRepository>;
  let parkingRepository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateParkingSpotCommandHandler,
        {
          provide: ParkingSpotRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ParkingRepository,
          useValue: {
            findById: jest.fn(),
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

    handler = module.get<DeactivateParkingSpotCommandHandler>(
      DeactivateParkingSpotCommandHandler,
    );
    repository = module.get(ParkingSpotRepository);
    parkingRepository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should deactivate and save an existing parking spot', async () => {
    const id = randomUUID();
    const ownerIdStr = randomUUID();
    const parkingSpot = ParkingSpot.create(randomUUID(), 10, []);
    repository.findById.mockResolvedValue(parkingSpot);

    const ownerId = OwnerId.fromString(ownerIdStr);
    const parking = {
      getOwnerId: () => ownerId,
    } as Parking;
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new DeactivateParkingSpotCommand(
      id,
      parkingSpot.getVersion().value,
      ownerIdStr,
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parkingSpot);
    expect(repository.save).toHaveBeenCalledWith(parkingSpot);
    /* eslint-enable @typescript-eslint/unbound-method */
    expect(parkingSpot.isActive()).toBe(false);
  });

  it('should throw error if parking spot not found', async () => {
    const id = randomUUID();
    repository.findById.mockResolvedValue(null);

    const command = new DeactivateParkingSpotCommand(id, 1, randomUUID());

    await expect(handler.execute(command)).rejects.toThrow(AppError);
  });
});
