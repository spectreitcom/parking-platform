import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockCommand } from '../commands/block.command';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@CommandHandler(BlockCommand)
export class BlockCommandHandler implements ICommandHandler<
  BlockCommand,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BlockCommand): Promise<void> {
    const { parkingSpotId } = command;

    await this.prisma.availability.upsert({
      where: { parkingSpotId },
      update: { available: false },
      create: {
        parkingSpotId,
        available: false,
      },
    });
  }
}
