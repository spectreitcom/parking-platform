import { IQuery } from '@nestjs/cqrs';

export class GetPlaceForEditingQuery implements IQuery {
  constructor(public readonly placeId: string) {}
}
