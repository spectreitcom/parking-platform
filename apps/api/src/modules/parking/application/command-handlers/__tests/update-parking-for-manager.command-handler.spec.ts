import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingForManagerCommandHandler } from '../update-parking-for-manager.command-handler';
import { UpdateParkingForManagerCommand } from '../../commands/update-parking-for-manager.command';
import { ParkingRepository } from '../../ports/parking.repository';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';
import { AppError } from 'src/shared/errors';

describe('UpdateParkingForManagerCommandHandler', () => {
  let handler: UpdateParkingForManagerCommandHandler;
  let repository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingForManagerCommandHandler,
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

    handler = module.get<UpdateParkingForManagerCommandHandler>(
      UpdateParkingForManagerCommandHandler,
    );
    repository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update a parking for manager', async () => {
    const parkingId = randomUUID();
    const organizationId = randomUUID();
    const placeId = randomUUID();
    const parking = Parking.create(
      organizationId,
      'Old Name',
      'Old Address',
      { longitude: 21.0122, latitude: 52.2297 },
      placeId,
      parkingId,
    );
    repository.findById.mockResolvedValue(parking);

    const command = new UpdateParkingForManagerCommand(
      parkingId,
      'New Name',
      [randomUUID()],
      [randomUUID()],
      [randomUUID()],
      'New Description',
      'New Statute',
      1,
    );

    const result = await handler.execute(command);

    expect(result).toBe(parking.getId().value);
    expect(parking.getName().value).toBe(command.name);
    expect(parking.getDescription()).toBe(command.description);
    expect(parking.getStatute()).toBe(command.statute);
    expect(parking.getAssetIds().map((id) => id.value)).toEqual(
      command.assetIds,
    );
    expect(parking.getParkingFeatureIds().map((id) => id.value)).toEqual(
      command.parkingFeatureIds,
    );
    expect(parking.getParkingAddonIds().map((id) => id.value)).toEqual(
      command.parkingAddonIds,
    );

    // Verify that address and coords remained the same (as per handler implementation)
    expect(parking.getAddress().value).toBe('Old Address');
    expect(parking.getCoords().longitude).toBe(21.0122);
    expect(parking.getCoords().latitude).toBe(52.2297);

    expect(repository.findById).toHaveBeenCalledWith(parkingId);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parking);
    expect(repository.save).toHaveBeenCalledWith(parking);
  });

  it('should throw ENTITY_NOT_FOUND if parking does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new UpdateParkingForManagerCommand(
      randomUUID(),
      'Name',
      [],
      [],
      [],
      'Desc',
      'Statue',
      1,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'ENTITY_NOT_FOUND',
        `Parking with id ${command.id} not found`,
      ),
    );
  });

  it('should throw CONCURRENCY if versions do not match', async () => {
    const parkingId = randomUUID();
    const organizationId = randomUUID();
    const placeId = randomUUID();
    const parking = Parking.create(
      organizationId,
      'Name',
      'Address',
      { longitude: 21.0122, latitude: 52.2297 },
      placeId,
      parkingId,
    );
    repository.findById.mockResolvedValue(parking);

    const command = new UpdateParkingForManagerCommand(
      parkingId,
      'Name',
      [],
      [],
      [],
      'Desc',
      'Statue',
      2, // version 2 instead of 1
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Parking with id ${command.id} has been modified by another process`,
      ),
    );
  });
});
