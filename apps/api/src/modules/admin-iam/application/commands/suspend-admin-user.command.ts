import { ICommand } from '@nestjs/cqrs';

export class SuspendAdminUserCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly version: number,
  ) {}
}
