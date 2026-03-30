import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationUserByIdQuery implements IQuery {
  constructor(public readonly organizationUserId: string) {}
}
