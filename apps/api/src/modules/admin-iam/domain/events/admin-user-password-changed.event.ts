import { IEvent } from '@nestjs/cqrs';

export class AdminUserPasswordChangedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly updatedAt: Date,
  ) {}
}
