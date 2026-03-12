import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserUpdatedEvent implements IEvent {
  constructor(
    public readonly organizationUserId: string,
    public readonly displayName: string,
    public readonly updatedAt: Date,
  ) {}
}
