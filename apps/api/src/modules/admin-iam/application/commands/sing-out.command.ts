import { ICommand } from '@nestjs/cqrs';

export class SingOutCommand implements ICommand {
  constructor(public readonly adminUserId: string) {}
}
