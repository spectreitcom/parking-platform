import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingSpotCommandHandler } from '../update-parking-spot.command-handler';
import { UpdateParkingSpotCommand } from '../../commands/update-parking-spot.command';
import { ParkingSpotRepository } from '../../ports/parking-spot.repository';
import { ParkingRepository } from '../../ports/parking.repository';
import { ParkingSpot } from '../../../domain/parking-spot';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';

describe('UpdateParkingSpotCommandHandler', () => {
  let handler: UpdateParkingSpotCommandHandler;
  let parkingSpotRepository: jest.Mocked<ParkingSpotRepository>;
  let parkingRepository: jest.Mocked<ParkingRepository>;
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

    handler = module.get<UpdateParkingSpotCommandHandler>(
      UpdateParkingSpotCommandHandler,
    );
    parkingSpotRepository = module.get(ParkingSpotRepository);
    parkingRepository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update a parking spot', async () => {
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

    const newPrice = 12000;
    const newFeatures = [randomUUID()];
    const command = new UpdateParkingSpotCommand(
      parkingSpot.getId().value,
      newPrice,
      newFeatures,
      parkingSpot.getVersion().value,
      organizationId,
    );

    const result = await handler.execute(command);

    expect(result).toBe(parkingSpot.getId().value);
    expect(parkingSpot.getPrice().value).toBe(newPrice);
    expect(parkingSpot.getParkingSpotFeatureIds().map((f) => f.value)).toEqual(
      newFeatures,
    );
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(parkingSpotRepository.save).toHaveBeenCalledWith(parkingSpot);
    /* eslint-enable @typescript-eslint/unbound-method */
  });

  it('should throw ENTITY_NOT_FOUND if parking spot does not exist', async () => {
    parkingSpotRepository.findById.mockResolvedValue(null);

    const command = new UpdateParkingSpotCommand(
      randomUUID(),
      10000,
      [],
      1,
      randomUUID(),
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
      message: `Parking spot with id ${command.id} not found`,
    });
  });

  it('should throw ENTITY_NOT_FOUND if parking does not exist', async () => {
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
    parkingRepository.findById.mockResolvedValue(null);

    const command = new UpdateParkingSpotCommand(
      parkingSpot.getId().value,
      12000,
      [],
      parkingSpot.getVersion().value,
      organizationId,
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
      message: `Parking with id ${parkingSpot.getParkingId().value} not found`,
    });
  });

  it('should throw FORBIDDEN_OPERATION if user organization does not match parking organization', async () => {
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

    const differentOrganizationId = randomUUID();
    const command = new UpdateParkingSpotCommand(
      parkingSpot.getId().value,
      12000,
      [],
      parkingSpot.getVersion().value,
      differentOrganizationId,
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'FORBIDDEN_OPERATION',
      message: 'You are not authorized for this organization',
    });
  });

  it('should throw CONCURRENCY if parking spot version does not match', async () => {
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

    const command = new UpdateParkingSpotCommand(
      parkingSpot.getId().value,
      12000,
      [],
      parkingSpot.getVersion().value + 1,
      organizationId,
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'CONCURRENCY',
      message: `Parking spot with id ${command.id} has been modified by another process`,
    });
  });
});
