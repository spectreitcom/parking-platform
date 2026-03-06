import { ICommand } from '@nestjs/cqrs';

export class ActivateAdminUserCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly version: number,
  ) {}
}
