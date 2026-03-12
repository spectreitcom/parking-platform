import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserPasswordChangedEvent implements IEvent {
  constructor(public readonly organizationUserId: string) {}
}
