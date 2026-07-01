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
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<UnblockCommandHandler>(UnblockCommandHandler);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should upsert availability to true', async () => {
    const parkingSpotId = 'some-uuid';

    await handler.execute(new UnblockCommand(parkingSpotId));

    expect(prismaService.availability.upsert).toHaveBeenCalledWith({
      where: { parkingSpotId },
      update: { available: true },
      create: {
        parkingSpotId,
        available: true,
      },
    });
  });
});
