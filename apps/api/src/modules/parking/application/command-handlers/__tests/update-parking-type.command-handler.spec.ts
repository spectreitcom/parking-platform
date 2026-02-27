import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingTypeCommandHandler } from '../update-parking-type.command-handler';
import { UpdateParkingTypeCommand } from '../../commands/update-parking-type.command';
import { ParkingTypeRepository } from '../../ports/parking-type.repository';
import { ParkingType } from '../../../domain/parking-type';
import { AppError } from '../../../../../shared/errors';

describe('UpdateParkingTypeCommandHandler', () => {
  let handler: UpdateParkingTypeCommandHandler;
  let repository: jest.Mocked<ParkingTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingTypeCommandHandler,
        {
          provide: ParkingTypeRepository,
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

    handler = module.get<UpdateParkingTypeCommandHandler>(
      UpdateParkingTypeCommandHandler,
    );
    repository = module.get(ParkingTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing parking type', async () => {
    const parkingType = ParkingType.create('Standard');
    const id = parkingType.getId().value;
    repository.findById.mockResolvedValue(parkingType);
    const command = new UpdateParkingTypeCommand(id, 'Premium');

    const result = await handler.execute(command);

    expect(result).toBe(id);
    expect(jest.spyOn(repository, 'findById')).toHaveBeenCalledWith(id);
    expect(jest.spyOn(publisher, 'mergeObjectContext')).toHaveBeenCalledWith(
      parkingType,
    );
    expect(parkingType.getName().value).toBe('Premium');
    expect(jest.spyOn(repository, 'save')).toHaveBeenCalledWith(parkingType);
  });

  it('should throw AppError if parking type not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new UpdateParkingTypeCommand('non-existent', 'Premium');

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });
});
