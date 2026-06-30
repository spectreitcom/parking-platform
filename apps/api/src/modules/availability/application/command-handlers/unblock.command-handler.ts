import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnblockCommand } from '../commands/unblock.command';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@CommandHandler(UnblockCommand)
export class UnblockCommandHandler implements ICommandHandler<
  UnblockCommand,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UnblockCommand): Promise<void> {
    const { parkingSpotId } = command;

    const availability = await this.prisma.availability.findFirst({
      where: { parkingSpotId },
    });

    if (availability) {
      await this.prisma.availability.update({
        where: { id: availability.id },
        data: { available: true },
      });
    } else {
      await this.prisma.availability.create({
        data: {
          parkingSpotId,
          available: true,
        },
      });
    }
  }
}
