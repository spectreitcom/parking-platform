import { IQuery } from '@nestjs/cqrs';

export class GetParkingFeatureByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
