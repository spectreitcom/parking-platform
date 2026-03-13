import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingFeatureCommandHandler } from '../create-parking-feature.command-handler';
import { CreateParkingFeatureCommand } from '../../commands/create-parking-feature.command';
import { ParkingFeatureRepository } from '../../ports/parking-feature.repository';
import { ParkingFeature } from '../../../domain/parking-feature';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../../../domain/constants';

describe('CreateParkingFeatureCommandHandler', () => {
  let handler: CreateParkingFeatureCommandHandler;
  let repository: jest.Mocked<ParkingFeatureRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParkingFeatureCommandHandler,
        {
          provide: ParkingFeatureRepository,
          useValue: {
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

    handler = module.get<CreateParkingFeatureCommandHandler>(
      CreateParkingFeatureCommandHandler,
    );
    repository = module.get(ParkingFeatureRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new parking feature', async () => {
    const command = new CreateParkingFeatureCommand('Underground', [
      PARKING_LEVEL,
      PARKING_SPOT_LEVEL,
    ]);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(repository.save).toHaveBeenCalledWith(expect.any(ParkingFeature), {
      isNew: true,
    });
    expect(publisher.mergeObjectContext).toHaveBeenCalled();
  });
});
