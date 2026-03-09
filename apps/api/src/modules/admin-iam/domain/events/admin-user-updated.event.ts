import { IEvent } from '@nestjs/cqrs';

export class AdminUserUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly isSuperAdmin: boolean,
    public readonly displayName: string,
    public readonly status: string,
    public readonly updatedAt: Date,
  ) {}
}
