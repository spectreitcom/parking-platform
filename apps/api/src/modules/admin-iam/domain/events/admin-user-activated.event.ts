import { IEvent } from '@nestjs/cqrs';

export class AdminUserActivatedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
