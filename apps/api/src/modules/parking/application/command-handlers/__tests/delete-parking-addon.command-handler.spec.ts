import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteParkingAddonCommandHandler } from '../delete-parking-addon.command-handler';
import { DeleteParkingAddonCommand } from '../../commands/delete-parking-addon.command';
import { ParkingAddonRepository } from '../../ports/parking-addon.repository';
import { ParkingAddon } from '../../../domain/parking-addon';
import { AppError } from '../../../../../shared/errors';

describe('DeleteParkingAddonCommandHandler', () => {
  let handler: DeleteParkingAddonCommandHandler;
  let repository: jest.Mocked<ParkingAddonRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteParkingAddonCommandHandler,
        {
          provide: ParkingAddonRepository,
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

    handler = module.get<DeleteParkingAddonCommandHandler>(
      DeleteParkingAddonCommandHandler,
    );
    repository = module.get(ParkingAddonRepository);
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  it('should delete an existing parking addon', async () => {
    const addon = ParkingAddon.create('PA1', 'Premium', 1000);
    const command = new DeleteParkingAddonCommand(
      addon.getId().value,
      addon.getVersion().value,
    );
    repository.findById.mockResolvedValue(addon);

    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(addon.getId().value);
    expect(repository.delete).toHaveBeenCalledWith(
      addon.getId().value,
      addon.getVersion().value,
    );
  });

  it('should throw error if addon not found', async () => {
    const command = new DeleteParkingAddonCommand('non-existent', 1);
    repository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw AppError if version is invalid', async () => {
    const addon = ParkingAddon.create('PA1', 'Premium', 1000);
    const command = new DeleteParkingAddonCommand(addon.getId().value, -1);
    repository.findById.mockResolvedValue(addon);

    try {
      await handler.execute(command);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION_ERROR');
    }
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
