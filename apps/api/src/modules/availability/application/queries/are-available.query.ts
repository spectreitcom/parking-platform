import { IQuery } from '@nestjs/cqrs';

export class AreAvailableQuery implements IQuery {
  constructor(public readonly parkingSpotIds: string[]) {}
}
