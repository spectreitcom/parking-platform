import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IsAvailableQuery } from './queries/is-available.query';
import { BlockCommand } from './commands/block.command';
import { UnblockCommand } from './commands/unblock.command';

@Injectable()
export class AvailabilityFacade {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async isAvailable(parkingSpotId: string): Promise<boolean> {
    return this.queryBus.execute(new IsAvailableQuery(parkingSpotId));
  }

  async block(parkingSpotId: string): Promise<void> {
    return this.commandBus.execute(new BlockCommand(parkingSpotId));
  }

  async unblock(parkingSpotId: string): Promise<void> {
    return this.commandBus.execute(new UnblockCommand(parkingSpotId));
  }
}
