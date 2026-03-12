import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserSuspendedEvent implements IEvent {
  constructor(public readonly organizationUserId: string) {}
}
