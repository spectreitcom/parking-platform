import { ICommand } from '@nestjs/cqrs';

export class CreateOrganizationUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
    public readonly passwordHash?: string,
  ) {}
}
