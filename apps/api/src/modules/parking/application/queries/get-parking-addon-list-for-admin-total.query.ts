import { IQuery } from '@nestjs/cqrs';

export class GetParkingAddonListForAdminTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
