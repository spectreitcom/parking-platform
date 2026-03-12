import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateParkingAddonCommandHandler } from '../update-parking-addon.command-handler';
import { UpdateParkingAddonCommand } from '../../commands/update-parking-addon.command';
import { ParkingAddonRepository } from '../../ports/parking-addon.repository';
import { ParkingAddon } from '../../../domain/parking-addon';
import { AppError } from '../../../../../shared/errors';

describe('UpdateParkingAddonCommandHandler', () => {
  let handler: UpdateParkingAddonCommandHandler;
  let repository: jest.Mocked<ParkingAddonRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParkingAddonCommandHandler,
        {
          provide: ParkingAddonRepository,
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

    handler = module.get<UpdateParkingAddonCommandHandler>(
      UpdateParkingAddonCommandHandler,
    );
    repository = module.get(ParkingAddonRepository);
  });

  it('should update and save an existing parking addon', async () => {
    const addon = ParkingAddon.create('PA1', 'Old Name', 1000);
    const command = new UpdateParkingAddonCommand(
      addon.getId().value,
      'New Name',
      2000,
      addon.getVersion().value,
    );
    repository.findById.mockResolvedValue(addon);

    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(addon.getId().value);
    expect(addon.getName().value).toBe('New Name');
    expect(addon.getPrice().value).toBe(2000);
    expect(repository.save).toHaveBeenCalledWith(addon);
  });

  it('should throw error if addon not found', async () => {
    const command = new UpdateParkingAddonCommand(
      'non-existent',
      'New Name',
      2000,
      1,
    );
    repository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw AppError if version is invalid', async () => {
    const addon = ParkingAddon.create('PA1', 'Old Name', 1000);
    const command = new UpdateParkingAddonCommand(
      addon.getId().value,
      'New Name',
      2000,
      -1,
    );
    repository.findById.mockResolvedValue(addon);

    try {
      await handler.execute(command);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION_ERROR');
    }
    expect(repository.save).not.toHaveBeenCalled();
  });
});
