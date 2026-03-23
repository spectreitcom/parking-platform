import { IQuery } from '@nestjs/cqrs';

export class GetPlaceTypeListTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
