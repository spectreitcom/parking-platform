import { ICommand } from '@nestjs/cqrs';

export class UpdateOrganizationUserCommand implements ICommand {
  constructor(
    public readonly organizationUserId: string,
    public readonly displayName: string,
    public readonly version: number,
  ) {}
}
