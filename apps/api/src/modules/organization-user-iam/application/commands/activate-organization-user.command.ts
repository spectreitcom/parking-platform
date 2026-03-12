import { ICommand } from '@nestjs/cqrs';

export class ActivateOrganizationUserCommand implements ICommand {
  constructor(
    public readonly organizationUserId: string,
    public readonly version: number,
  ) {}
}
