import { ICommand } from '@nestjs/cqrs';

export class SignOutCommand implements ICommand {
  constructor(public readonly adminUserId: string) {}
}
