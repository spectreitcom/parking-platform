import { ICommand } from '@nestjs/cqrs';

export class BlockCommand implements ICommand {
  constructor(public readonly parkingSpotId: string) {}
}
