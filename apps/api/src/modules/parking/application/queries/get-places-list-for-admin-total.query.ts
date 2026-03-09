import { IQuery } from '@nestjs/cqrs';

export class GetPlacesListForAdminTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
