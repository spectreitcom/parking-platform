import { IEvent } from '@nestjs/cqrs';

export class OrganizationUserInvitedEvent implements IEvent {
  constructor(
    public readonly organizationUserId: string,
    public readonly email: string,
    public readonly status: string,
    public readonly displayName: string,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly passwordHash?: string,
  ) {}
}
