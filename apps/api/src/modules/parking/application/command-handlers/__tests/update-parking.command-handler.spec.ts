import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingCommandHandler } from '../update-parking.command-handler';
import { UpdateParkingCommand } from '../../commands/update-parking.command';
import { ParkingRepository } from '../../ports/parking.repository';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('UpdateParkingCommandHandler', () => {
  let handler: UpdateParkingCommandHandler;
  let repository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingCommandHandler,
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

    handler = module.get<UpdateParkingCommandHandler>(
      UpdateParkingCommandHandler,
    );
    repository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update a parking', async () => {
    const parkingId = randomUUID();
    const parking = Parking.create(
      randomUUID(),
      'Old Name',
      'Old Address',
      { longitude: 21.0122, latitude: 52.2297 },
      randomUUID(),
    );
    repository.findById.mockResolvedValue(parking);

    const command = new UpdateParkingCommand(
      parkingId,
      'New Name',
      'New Address',
      22.0122,
      53.2297,
      randomUUID(),
      [randomUUID()],
      [randomUUID()],
      [randomUUID()],
      'New Description',
      'New Statue',
      1,
    );

    const result = await handler.execute(command);

    expect(result).toBe(parking.getId().value);
    expect(parking.getName().value).toBe(command.name);
    expect(parking.getAddress().value).toBe(command.address);
    expect(parking.getCoords().longitude).toBe(command.longitude);
    expect(parking.getCoords().latitude).toBe(command.latitude);
    expect(parking.getDescription()).toBe(command.description);
    expect(parking.getStatue()).toBe(command.statue);
    expect(parking.getAssetIds().map((id) => id.value)).toEqual(
      command.assetIds,
    );
    expect(parking.getParkingFeatureIds().map((id) => id.value)).toEqual(
      command.parkingFeatureIds,
    );
    expect(parking.getParkingAddonIds().map((id) => id.value)).toEqual(
      command.parkingAddonIds,
    );

    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(parkingId);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parking);
    expect(repository.save).toHaveBeenCalledWith(parking);
    /* eslint-enable @typescript-eslint/unbound-method */
  });

  it('should throw ENTITY_NOT_FOUND if parking does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new UpdateParkingCommand(
      randomUUID(),
      'Name',
      'Address',
      21.0122,
      52.2297,
      randomUUID(),
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
    const parking = Parking.create(
      randomUUID(),
      'Name',
      'Address',
      { longitude: 21.0122, latitude: 52.2297 },
      randomUUID(),
    );
    repository.findById.mockResolvedValue(parking);

    const command = new UpdateParkingCommand(
      parking.getId().value,
      'Name',
      'Address',
      21.0122,
      52.2297,
      randomUUID(),
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
