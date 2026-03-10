import { ICommand } from '@nestjs/cqrs';

export class InviteAdminUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
  ) {}
}
