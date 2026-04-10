import { IEvent } from '@nestjs/cqrs';

export class UserChangedPasswordEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly updatedAt: Date,
  ) {}
}
