import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserInvitedEvent implements IEvent {
  constructor(public readonly organizationUserId: string) {}
}
