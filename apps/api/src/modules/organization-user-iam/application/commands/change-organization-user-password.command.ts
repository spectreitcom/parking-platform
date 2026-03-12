import { ICommand } from '@nestjs/cqrs';

export class ChangeOrganizationUserPasswordCommand implements ICommand {
  constructor(
    public readonly organizationUserId: string,
    public readonly passwordHash: string,
    public readonly version: number,
  ) {}
}
