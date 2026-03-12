import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationListForAdminTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
