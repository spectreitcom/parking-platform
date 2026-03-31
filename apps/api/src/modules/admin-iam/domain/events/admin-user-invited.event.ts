import { IEvent } from '@nestjs/cqrs';

export class AdminUserInvitedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly isSuperAdmin: boolean,
    public readonly displayName: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
