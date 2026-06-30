import { ICommand } from '@nestjs/cqrs';

export class UnblockCommand implements ICommand {
  constructor(public readonly parkingSpotId: string) {}
}
