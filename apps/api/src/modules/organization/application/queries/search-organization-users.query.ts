import { IQuery } from '@nestjs/cqrs';

export class SearchOrganizationUsersQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
