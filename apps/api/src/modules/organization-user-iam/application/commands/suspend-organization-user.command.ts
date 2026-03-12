import { ICommand } from '@nestjs/cqrs';

export class SuspendOrganizationUserCommand implements ICommand {
  constructor(
    public readonly organizationUserId: string,
    public readonly version: number,
  ) {}
}
