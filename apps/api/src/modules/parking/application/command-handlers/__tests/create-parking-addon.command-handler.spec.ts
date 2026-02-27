import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingAddonCommandHandler } from '../create-parking-addon.command-handler';
import { CreateParkingAddonCommand } from '../../commands/create-parking-addon.command';
import { ParkingAddonRepository } from '../../ports/parking-addon.repository';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { ParkingAddon } from '../../../domain/parking-addon';
import { AppError } from '../../../../../shared/errors';

describe('CreateParkingAddonCommandHandler', () => {
  let handler: CreateParkingAddonCommandHandler;
  let repository: jest.Mocked<ParkingAddonRepository>;
  let publisher: jest.Mocked<EventPublisher>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParkingAddonCommandHandler,
        {
          provide: ParkingAddonRepository,
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
        {
          provide: PrismaService,
          useValue: {
            parkingAddon: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<CreateParkingAddonCommandHandler>(
      CreateParkingAddonCommandHandler,
    );
    repository = module.get(ParkingAddonRepository);
    publisher = module.get(EventPublisher);
    prisma = module.get(PrismaService);
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  it('should create and save a new parking addon', async () => {
    const command = new CreateParkingAddonCommand('PA1', 'Premium', 1000);
    (prisma.parkingAddon.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(prisma.parkingAddon.findUnique).toHaveBeenCalledWith({
      where: { code: 'PA1' },
    });
    expect(repository.save).toHaveBeenCalledWith(expect.any(ParkingAddon));
    expect(publisher.mergeObjectContext).toHaveBeenCalled();
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  it('should throw error if addon with code already exists', async () => {
    const command = new CreateParkingAddonCommand('PA1', 'Premium', 1000);
    (prisma.parkingAddon.findUnique as jest.Mock).mockResolvedValue({
      id: 'some-id',
    });

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
