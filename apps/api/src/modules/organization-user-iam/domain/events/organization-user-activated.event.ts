import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserActivatedEvent implements IEvent {
  constructor(public readonly organizationUserId: string) {}
}
