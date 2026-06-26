import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingSpotCommandHandler } from '../create-parking-spot.command-handler';
import { CreateParkingSpotCommand } from '../../commands/create-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingRepository } from '../../ports/parking.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';
import { AppError } from 'src/shared/errors';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { PrismaTx } from 'src/shared/prisma/types';

describe('CreateParkingSpotCommandHandler', () => {
  let handler: CreateParkingSpotCommandHandler;
  let parkingSpotRepository: jest.Mocked<ParkingSpotRepository>;
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
        {
          provide: OutboxService,
          useValue: {
            enqueue: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: {
            runInTransaction: jest.fn(
              (cb: (tx: PrismaTx) => Promise<unknown>) =>
                cb({
                  parkingSpotRead: {
                    findMany: jest.fn().mockResolvedValue([]),
                  },
                  parkingFeatureRead: {
                    findMany: jest.fn().mockResolvedValue([]),
                  },
                } as unknown as PrismaTx),
            ),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateParkingSpotCommandHandler>(
      CreateParkingSpotCommandHandler,
    );
    parkingSpotRepository = module.get(ParkingSpotRepository);
    parkingRepository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create a parking spot', async () => {
    const organizationId = randomUUID();
    const parking = Parking.create(
      organizationId,
      'Test Parking',
      'Address',
      { latitude: 52, longitude: 21 },
      randomUUID(),
    );
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new CreateParkingSpotCommand(
      parking.getId().value,
      10000,
      [],
      organizationId,
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();

    expect(publisher.mergeObjectContext).toHaveBeenCalled();
    expect(parkingSpotRepository.save).toHaveBeenCalledWith(
      expect.any(ParkingSpot),
      { isNew: true, tx: expect.anything() as PrismaTx },
    );
  });

  it('should throw ENTITY_NOT_FOUND if parking does not exist', async () => {
    parkingRepository.findById.mockResolvedValue(null);

    const command = new CreateParkingSpotCommand(
      randomUUID(),
      10000,
      [],
      randomUUID(),
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'ENTITY_NOT_FOUND',
        `Parking with id ${command.parkingId} not found`,
      ),
    );
  });

  it('should throw FORBIDDEN_OPERATION if not authorized for this organization', async () => {
    const organizationId = randomUUID();
    const parking = Parking.create(
      randomUUID(), // Different owner
      'Test Parking',
      'Address',
      { latitude: 52, longitude: 21 },
      randomUUID(),
    );
    parkingRepository.findById.mockResolvedValue(parking);

    const command = new CreateParkingSpotCommand(
      parking.getId().value,
      10000,
      [],
      organizationId,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'FORBIDDEN_OPERATION',
        `You are not authorized for this organization`,
      ),
    );
  });
});
