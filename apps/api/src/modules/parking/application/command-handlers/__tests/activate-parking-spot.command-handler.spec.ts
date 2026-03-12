import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { ActivateParkingSpotCommandHandler } from '../activate-parking-spot.command-handler';
import { ActivateParkingSpotCommand } from '../../commands/activate-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingRepository } from '../../ports/parking.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('ActivateParkingSpotCommandHandler', () => {
  let handler: ActivateParkingSpotCommandHandler;
  let parkingSpotRepository: jest.Mocked<ParkingSpotRepository>;
  let parkingRepository: jest.Mocked<ParkingRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateParkingSpotCommandHandler,
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

    handler = module.get<ActivateParkingSpotCommandHandler>(
      ActivateParkingSpotCommandHandler,
    );
    parkingSpotRepository = module.get(ParkingSpotRepository);
    parkingRepository = module.get(ParkingRepository);
  });

  it('should activate a parking spot', async () => {
    const organizationId = randomUUID();
    const parking = Parking.create(
      organizationId,
      'Test Parking',
      'Address',
      { latitude: 52, longitude: 21 },
      randomUUID(),
    );
    const parkingSpot = ParkingSpot.create(parking.getId().value, 10000, []);

    parkingSpotRepository.findById.mockResolvedValue(parkingSpot);
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new ActivateParkingSpotCommand(
      parkingSpot.getId().value,
      parkingSpot.getVersion().value,
      organizationId,
    );

    const result = await handler.execute(command);

    expect(result).toBe(parkingSpot.getId().value);
    expect(parkingSpot.isActive()).toBe(true);

    expect(parkingSpotRepository.save).toHaveBeenCalledWith(parkingSpot);
  });

  it('should throw ENTITY_NOT_FOUND if parking spot does not exist', async () => {
    parkingSpotRepository.findById.mockResolvedValue(null);

    const command = new ActivateParkingSpotCommand(
      randomUUID(),
      1,
      randomUUID(),
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'ENTITY_NOT_FOUND',
        `Parking spot with id ${command.id} not found`,
      ),
    );
  });

  it('should throw FORBIDDEN_OPERATION if not authorized for this organization', async () => {
    const parking = Parking.create(
      randomUUID(),
      'Test Parking',
      'Address',
      { latitude: 52, longitude: 21 },
      randomUUID(),
    );
    const parkingSpot = ParkingSpot.create(parking.getId().value, 10000, []);

    parkingSpotRepository.findById.mockResolvedValue(parkingSpot);
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new ActivateParkingSpotCommand(
      parkingSpot.getId().value,
      parkingSpot.getVersion().value,
      randomUUID(), // Different owner
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'FORBIDDEN_OPERATION',
        `You are not authorized for this organization`,
      ),
    );
  });

  it('should throw CONCURRENCY if versions do not match', async () => {
    const organizationId = randomUUID();
    const parking = Parking.create(
      organizationId,
      'Test Parking',
      'Address',
      { latitude: 52, longitude: 21 },
      randomUUID(),
    );
    const parkingSpot = ParkingSpot.create(parking.getId().value, 10000, []);

    parkingSpotRepository.findById.mockResolvedValue(parkingSpot);
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new ActivateParkingSpotCommand(
      parkingSpot.getId().value,
      10, // Wrong version
      organizationId,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Parking spot with id ${command.id} has been modified by another process`,
      ),
    );
  });
});
