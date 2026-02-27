import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteParkingTypeCommandHandler } from '../delete-parking-type.command-handler';
import { DeleteParkingTypeCommand } from '../../commands/delete-parking-type.command';
import { ParkingTypeRepository } from '../../ports/parking-type.repository';
import { ParkingType } from '../../../domain/parking-type';
import { AppError } from '../../../../../shared/errors';

describe('DeleteParkingTypeCommandHandler', () => {
  let handler: DeleteParkingTypeCommandHandler;
  let repository: jest.Mocked<ParkingTypeRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteParkingTypeCommandHandler,
        {
          provide: ParkingTypeRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    handler = module.get<DeleteParkingTypeCommandHandler>(
      DeleteParkingTypeCommandHandler,
    );
    repository = module.get(ParkingTypeRepository);
    publisher = module.get(EventPublisher);
  });

  it('should delete an existing parking type', async () => {
    const parkingType = ParkingType.create('Standard');
    const id = parkingType.getId().value;
    repository.findById.mockResolvedValue(parkingType);
    const command = new DeleteParkingTypeCommand(id);

    const result = await handler.execute(command);

    expect(result).toBe(id);
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(parkingType);
    expect(repository.delete).toHaveBeenCalledWith(id);
    /* eslint-enable @typescript-eslint/unbound-method */
  });

  it('should throw AppError if parking type not found', async () => {
    repository.findById.mockResolvedValue(null);
    const command = new DeleteParkingTypeCommand('non-existent');

    const exec = handler.execute(command);
    await expect(exec).rejects.toThrow(AppError);
    await expect(exec).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    });
  });
});
