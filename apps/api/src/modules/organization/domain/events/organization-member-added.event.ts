import { IEvent } from '@nestjs/cqrs';

export class OrganizationMemberAddedEvent implements IEvent {
  constructor(
    public readonly organizationId: string,
    public readonly memberId: string,
    public readonly isRoot: boolean,
    public readonly organizationUserId: string,
  ) {}
}
