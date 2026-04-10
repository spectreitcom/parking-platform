import { IEvent } from '@nestjs/cqrs';

export class UserUpdatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly provider: string,
    public readonly updatedAt: Date,
  ) {}
}
