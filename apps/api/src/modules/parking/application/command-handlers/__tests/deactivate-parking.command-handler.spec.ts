import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeactivateParkingCommandHandler } from '../deactivate-parking.command-handler';
import { DeactivateParkingCommand } from '../../commands/deactivate-parking.command';
import { ParkingRepository } from '../../ports/parking.repository';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('DeactivateParkingCommandHandler', () => {
  let handler: DeactivateParkingCommandHandler;
  let repository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateParkingCommandHandler,
        {
          provide: ParkingRepository,
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

    handler = module.get<DeactivateParkingCommandHandler>(
      DeactivateParkingCommandHandler,
    );
    repository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should deactivate a parking', async () => {
    const parkingId = randomUUID();
    const parking = Parking.create(
      randomUUID(),
      'Test Parking',
      'Test Address',
      { longitude: 21.0122, latitude: 52.2297 },
      randomUUID(),
    );
    repository.findById.mockResolvedValue(parking);

    const command = new DeactivateParkingCommand(parkingId, 1);
    const result = await handler.execute(command);

    expect(result).toBe(parking.getId().value);
    expect(parking.isActive()).toBe(false);

    expect(repository.findById).toHaveBeenCalledWith(parkingId);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parking);
    expect(repository.save).toHaveBeenCalledWith(parking);
  });

  it('should throw ENTITY_NOT_FOUND if parking does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new DeactivateParkingCommand(randomUUID(), 1);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'ENTITY_NOT_FOUND',
        `Parking with id ${command.id} not found`,
      ),
    );
  });

  it('should throw CONCURRENCY if versions do not match', async () => {
    const parking = Parking.create(
      randomUUID(),
      'Test Parking',
      'Test Address',
      { longitude: 21.0122, latitude: 52.2297 },
      randomUUID(),
    );
    repository.findById.mockResolvedValue(parking);

    const command = new DeactivateParkingCommand(parking.getId().value, 2); // version 2 instead of 1

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Parking with id ${command.id} has been modified by another process`,
      ),
    );
  });
});
