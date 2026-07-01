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

    await this.prisma.availability.upsert({
      where: { parkingSpotId },
      update: { available: true },
      create: {
        parkingSpotId,
        available: true,
      },
    });
  }
}
