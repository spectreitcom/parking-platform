import { ICommand } from '@nestjs/cqrs';

export class AddMemberCommand implements ICommand {
  constructor(
    public readonly organizationId: string,
    public readonly isRoot: boolean,
    public readonly organizationUserId: string,
    public readonly version: number,
  ) {}
}
