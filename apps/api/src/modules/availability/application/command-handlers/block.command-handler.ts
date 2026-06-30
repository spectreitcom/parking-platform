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

    const availability = await this.prisma.availability.findFirst({
      where: { parkingSpotId },
    });

    if (availability) {
      await this.prisma.availability.update({
        where: { id: availability.id },
        data: { available: false },
      });
    } else {
      await this.prisma.availability.create({
        data: {
          parkingSpotId,
          available: false,
        },
      });
    }
  }
}
