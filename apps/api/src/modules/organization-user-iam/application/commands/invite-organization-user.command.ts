import { ICommand } from '@nestjs/cqrs';

export class InviteOrganizationUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
  ) {}
}
