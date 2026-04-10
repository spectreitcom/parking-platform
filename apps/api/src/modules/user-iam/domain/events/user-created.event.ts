import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly provider: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
