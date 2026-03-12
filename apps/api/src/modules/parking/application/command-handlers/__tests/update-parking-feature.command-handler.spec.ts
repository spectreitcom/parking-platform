import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingFeatureCommandHandler } from '../update-parking-feature.command-handler';
import { UpdateParkingFeatureCommand } from '../../commands/update-parking-feature.command';
import { ParkingFeatureRepository } from '../../ports/parking-feature.repository';
import { ParkingFeature } from '../../../domain/parking-feature';
import { AppError } from '../../../../../shared/errors';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../../../domain/constants';

describe('UpdateParkingFeatureCommandHandler', () => {
  let handler: UpdateParkingFeatureCommandHandler;
  let repository: jest.Mocked<ParkingFeatureRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingFeatureCommandHandler,
        {
          provide: ParkingFeatureRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn((obj: unknown) => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateParkingFeatureCommandHandler>(
      UpdateParkingFeatureCommandHandler,
    );
    repository = module.get(ParkingFeatureRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing parking feature', async () => {
    const parkingFeature = ParkingFeature.create('Old Name', [PARKING_LEVEL]);
    const id = parkingFeature.getId().value;
    const version = parkingFeature.getVersion().value;

    repository.findById.mockResolvedValue(parkingFeature);

    const command = new UpdateParkingFeatureCommand(
      id,
      'New Name',
      [PARKING_LEVEL, PARKING_SPOT_LEVEL],
      version,
    );

    const result = await handler.execute(command);

    expect(result).toBe(id);
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(repository.save).toHaveBeenCalledWith(parkingFeature, {
      isNew: false,
    });
    expect(parkingFeature.getName().value).toBe('New Name');
    expect(parkingFeature.getLevels().length).toBe(2);
    expect(publisher.mergeObjectContext).toHaveBeenCalled();
  });

  it('should throw error if parking feature not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new UpdateParkingFeatureCommand(
      'non-existent',
      'New Name',
      [PARKING_LEVEL],
      1,
    );

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });

  it('should throw error if version mismatch (concurrency)', async () => {
    const parkingFeature = ParkingFeature.create('Old Name', [PARKING_LEVEL]);
    const id = parkingFeature.getId().value;
    repository.findById.mockResolvedValue(parkingFeature);

    const command = new UpdateParkingFeatureCommand(
      id,
      'New Name',
      [PARKING_LEVEL],
      10,
    ); // Wrong version

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'CONCURRENCY',
    });
  });
});
