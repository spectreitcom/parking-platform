import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingSpotCommandHandler } from '../create-parking-spot.command-handler';
import { CreateParkingSpotCommand } from '../../commands/create-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingRepository } from '../../ports/parking.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { Parking } from '../../../domain/parking';
import { OwnerId } from '../../../domain/value-objects/owner-id';
import { randomUUID } from 'node:crypto';

describe('CreateParkingSpotCommandHandler', () => {
  let handler: CreateParkingSpotCommandHandler;
  let repository: jest.Mocked<ParkingSpotRepository>;
  let parkingRepository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParkingSpotCommandHandler,
        {
          provide: ParkingSpotRepository,
          useValue: {
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

    handler = module.get<CreateParkingSpotCommandHandler>(
      CreateParkingSpotCommandHandler,
    );
    repository = module.get(ParkingSpotRepository);
    parkingRepository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new parking spot', async () => {
    const parkingId = randomUUID();
    const ownerIdStr = randomUUID();
    const command = new CreateParkingSpotCommand(
      parkingId,
      50,
      [randomUUID(), randomUUID()],
      ownerIdStr,
    );

    const ownerId = OwnerId.fromString(ownerIdStr);
    const parking = {
      getOwnerId: () => ownerId,
    } as Parking;

    parkingRepository.findById.mockResolvedValue(parking);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(
      expect.any(ParkingSpot),
    );
    expect(repository.save).toHaveBeenCalledWith(expect.any(ParkingSpot), {
      isNew: true,
    });
    /* eslint-enable @typescript-eslint/unbound-method */
    const savedSpot = repository.save.mock.calls[0][0];
    expect(savedSpot.getParkingId().value).toBe(command.parkingId);
    expect(savedSpot.getPrice().value).toBe(command.price);
    expect(savedSpot.getParkingSpotFeatureIds().map((f) => f.value)).toEqual(
      command.parkingSpotFeatureIds,
    );
    expect(savedSpot.isActive()).toBe(true);
  });
});
