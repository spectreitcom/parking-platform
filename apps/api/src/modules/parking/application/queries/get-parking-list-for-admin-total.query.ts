import { IQuery } from '@nestjs/cqrs';

export class GetParkingListForAdminTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
