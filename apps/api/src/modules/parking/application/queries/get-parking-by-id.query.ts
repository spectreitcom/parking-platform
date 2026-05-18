import { IQuery } from '@nestjs/cqrs';

export class GetParkingByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
