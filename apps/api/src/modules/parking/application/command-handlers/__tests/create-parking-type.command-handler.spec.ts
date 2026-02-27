import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingTypeCommandHandler } from '../create-parking-type.command-handler';
import { CreateParkingTypeCommand } from '../../commands/create-parking-type.command';
import { ParkingTypeRepository } from '../../ports/parking-type.repository';
import { ParkingType } from '../../../domain/parking-type';

describe('CreateParkingTypeCommandHandler', () => {
  let handler: CreateParkingTypeCommandHandler;
  let repository: jest.Mocked<ParkingTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParkingTypeCommandHandler,
        {
          provide: ParkingTypeRepository,
          useValue: {
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

    handler = module.get<CreateParkingTypeCommandHandler>(
      CreateParkingTypeCommandHandler,
    );
    repository = module.get(ParkingTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new parking type', async () => {
    const command = new CreateParkingTypeCommand('Standard');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(jest.spyOn(publisher, 'mergeObjectContext')).toHaveBeenCalledWith(
      expect.any(ParkingType),
    );
    expect(jest.spyOn(repository, 'save')).toHaveBeenCalledWith(
      expect.any(ParkingType),
    );
    const savedParkingType = repository.save.mock.calls[0][0];
    expect(savedParkingType.getName().value).toBe('Standard');
  });
});
