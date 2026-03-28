import { IEvent } from '@nestjs/cqrs';

export class OrganizationUpdatedEvent implements IEvent {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
    public readonly address: string,
    public readonly taxId: string,
    public readonly members: {
      id: string;
      isRoot: boolean;
      organizationUserId: string;
    }[],
    public readonly version: number,
  ) {}
}
