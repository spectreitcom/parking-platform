import { IEvent } from '@nestjs/cqrs';

export class OrganizationMemberRemovedEvent implements IEvent {
  constructor(
    public readonly organizationId: string,
    public readonly memberId: string,
    public readonly version: number,
  ) {}
}
