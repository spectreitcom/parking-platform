import { Test, TestingModule } from '@nestjs/testing';
import { BlockCommandHandler } from '../block.command-handler';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { BlockCommand } from '../../commands/block.command';

describe('BlockCommandHandler', () => {
  let handler: BlockCommandHandler;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockCommandHandler,
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

    handler = module.get<BlockCommandHandler>(BlockCommandHandler);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should update availability to false if record exists', async () => {
    const parkingSpotId = 'some-uuid';
    const existingRecord = { id: '1', parkingSpotId, available: true };
    jest
      .spyOn(prismaService.availability, 'findFirst')
      .mockResolvedValue(existingRecord);

    await handler.execute(new BlockCommand(parkingSpotId));

    expect(prismaService.availability.update).toHaveBeenCalledWith({
      where: { id: existingRecord.id },
      data: { available: false },
    });
    expect(prismaService.availability.create).not.toHaveBeenCalled();
  });

  it('should create availability as false if record does not exist', async () => {
    const parkingSpotId = 'some-uuid';
    jest.spyOn(prismaService.availability, 'findFirst').mockResolvedValue(null);

    await handler.execute(new BlockCommand(parkingSpotId));

    expect(prismaService.availability.create).toHaveBeenCalledWith({
      data: {
        parkingSpotId,
        available: false,
      },
    });
    expect(prismaService.availability.update).not.toHaveBeenCalled();
  });
});
