import { OrganizationUserId } from '../value-objects/organization-user-id';
import { OrganizationMemberId } from '../value-objects/organization-member-id';

export class OrganizationMember {
  constructor(
    public readonly id: OrganizationMemberId,
    public readonly isRoot: boolean,
    public readonly organizationUserId: OrganizationUserId,
  ) {}
}
