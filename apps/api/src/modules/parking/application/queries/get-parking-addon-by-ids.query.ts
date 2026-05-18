import { IQuery } from '@nestjs/cqrs';

export class GetParkingAddonByIdsQuery implements IQuery {
  constructor(public readonly ids: string[]) {}
}
