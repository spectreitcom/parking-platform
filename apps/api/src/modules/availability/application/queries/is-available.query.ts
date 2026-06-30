import { IQuery } from '@nestjs/cqrs';

export class IsAvailableQuery implements IQuery {
  constructor(public readonly parkingSpotId: string) {}
}
