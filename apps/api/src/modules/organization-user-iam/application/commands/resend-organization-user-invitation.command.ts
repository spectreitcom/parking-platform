import { ICommand } from '@nestjs/cqrs';

export class ResendOrganizationUserInvitationCommand implements ICommand {
  constructor(public readonly organizationUserId: string) {}
}
