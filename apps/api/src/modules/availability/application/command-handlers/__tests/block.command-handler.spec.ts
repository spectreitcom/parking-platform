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
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<BlockCommandHandler>(BlockCommandHandler);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should upsert availability to false', async () => {
    const parkingSpotId = 'some-uuid';

    await handler.execute(new BlockCommand(parkingSpotId));

    expect(prismaService.availability.upsert).toHaveBeenCalledWith({
      where: { parkingSpotId },
      update: { available: false },
      create: {
        parkingSpotId,
        available: false,
      },
    });
  });
});
