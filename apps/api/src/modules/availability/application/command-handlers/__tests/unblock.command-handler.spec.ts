import { Test, TestingModule } from '@nestjs/testing';
import { UnblockCommandHandler } from '../unblock.command-handler';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UnblockCommand } from '../../commands/unblock.command';

describe('UnblockCommandHandler', () => {
  let handler: UnblockCommandHandler;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnblockCommandHandler,
        {
          provide: PrismaService,
          useValue: {
            availability: {
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<UnblockCommandHandler>(UnblockCommandHandler);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should update availability to true if record exists', async () => {
    const parkingSpotId = 'some-uuid';
    const existingRecord = { id: '1', parkingSpotId, available: false };
    jest
      .spyOn(prismaService.availability, 'findFirst')
      .mockResolvedValue(existingRecord);

    await handler.execute(new UnblockCommand(parkingSpotId));

    expect(prismaService.availability.update).toHaveBeenCalledWith({
      where: { id: existingRecord.id },
      data: { available: true },
    });
    expect(prismaService.availability.create).not.toHaveBeenCalled();
  });

  it('should create availability as true if record does not exist', async () => {
    const parkingSpotId = 'some-uuid';
    jest.spyOn(prismaService.availability, 'findFirst').mockResolvedValue(null);

    await handler.execute(new UnblockCommand(parkingSpotId));

    expect(prismaService.availability.create).toHaveBeenCalledWith({
      data: {
        parkingSpotId,
        available: true,
      },
    });
    expect(prismaService.availability.update).not.toHaveBeenCalled();
  });
});
