import { Organization } from '../../domain/organization';
import { OrganizationId } from '../../domain/value-objects/organization-id';
import { OrganizationName } from '../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../domain/value-objects/organization-tax-id';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationMember } from '../../domain/entities/organization-member';
import { OrganizationMemberId } from '../../domain/value-objects/organization-member-id';
import { OrganizationUserId } from '../../domain/value-objects/organization-user-id';
import {
  Organization as OrganizationModel,
  OrganizationMember as OrganizationMemberModel,
} from '@prisma/client';

export class OrganizationMapper {
  static toDomain(
    raw: OrganizationModel & { members: OrganizationMemberModel[] },
  ): Organization {
    const members = (raw.members || []).map(
      (m: OrganizationMemberModel) =>
        new OrganizationMember(
          OrganizationMemberId.fromString(m.id),
          m.isRoot,
          OrganizationUserId.fromString(m.organizationUserId),
        ),
    );

    return Organization.reconstruct(
      OrganizationId.fromString(raw.id),
      OrganizationName.fromString(raw.name),
      OrganizationAddress.fromString(raw.address),
      OrganizationTaxId.fromString(raw.taxId),
      AggregateVersion.fromNumber(raw.version),
      members,
    );
  }

  static toPersistence(organization: Organization) {
    return {
      id: organization.getId().value,
      name: organization.getName().value,
      address: organization.getAddress().value,
      taxId: organization.getTaxId().value,
      version: organization.getVersion().value,
      members: organization.getMembers().map((m) => ({
        id: m.id.value,
        isRoot: m.isRoot,
        organizationUserId: m.organizationUserId.value,
      })),
    };
  }
}
