import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteParkingFeatureCommandHandler } from '../delete-parking-feature.command-handler';
import { DeleteParkingFeatureCommand } from '../../commands/delete-parking-feature.command';
import { ParkingFeatureRepository } from '../../ports/parking-feature.repository';
import { ParkingFeature } from '../../../domain/parking-feature';
import { AppError } from '../../../../../shared/errors';
import { PARKING_LEVEL } from '../../../domain/constants';

describe('DeleteParkingFeatureCommandHandler', () => {
  let handler: DeleteParkingFeatureCommandHandler;
  let repository: jest.Mocked<ParkingFeatureRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteParkingFeatureCommandHandler,
        {
          provide: ParkingFeatureRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    handler = module.get<DeleteParkingFeatureCommandHandler>(
      DeleteParkingFeatureCommandHandler,
    );
    repository = module.get(ParkingFeatureRepository);
    publisher = module.get(EventPublisher);
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  it('should delete an existing parking feature', async () => {
    const parkingFeature = ParkingFeature.create('To Delete', [PARKING_LEVEL]);
    const id = parkingFeature.getId().value;
    const version = parkingFeature.getVersion().value;

    repository.findById.mockResolvedValue(parkingFeature);

    const command = new DeleteParkingFeatureCommand(id, version);

    const result = await handler.execute(command);

    expect(result).toBe(id);
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(repository.delete).toHaveBeenCalledWith(id, version);
    expect(publisher.mergeObjectContext).toHaveBeenCalled();
  });

  it('should throw error if parking feature not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new DeleteParkingFeatureCommand('non-existent', 1);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });

  it('should throw error if version mismatch (concurrency)', async () => {
    const parkingFeature = ParkingFeature.create('To Delete', [PARKING_LEVEL]);
    const id = parkingFeature.getId().value;
    repository.findById.mockResolvedValue(parkingFeature);

    const command = new DeleteParkingFeatureCommand(id, 10); // Wrong version

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'CONCURRENCY',
    });
  });
});
