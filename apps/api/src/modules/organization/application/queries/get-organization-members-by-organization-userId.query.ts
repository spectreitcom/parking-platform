import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationMembersByOrganizationUserIdQuery implements IQuery {
  constructor(public readonly organizationUserId: string) {}
}
