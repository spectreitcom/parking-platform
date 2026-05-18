import { IQuery } from '@nestjs/cqrs';

export class GetParkingFeatureByIdsQuery implements IQuery {
  constructor(public readonly ids: string[]) {}
}
