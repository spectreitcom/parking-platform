import { OrganizationUser } from '../../domain/organization-user';
import { OrganizationUserId } from '../../domain/value-objects/organization-user-id';
import { Email } from '../../../../shared/value-objects/email';
import { OrganizationUserStatus } from '../../domain/value-objects/organization-user-status';
import { OrganizationUserDisplayName } from '../../domain/value-objects/organization-user-display-name';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { OrganizationUser as OrganizationUserModel } from '@prisma/client';

export class OrganizationUserMapper {
  static toDomain(raw: OrganizationUserModel): OrganizationUser {
    return OrganizationUser.reconstruct(
      OrganizationUserId.fromString(raw.id),
      Email.fromString(raw.email),
      OrganizationUserStatus.fromString(raw.status),
      AggregateVersion.fromNumber(raw.version),
      OrganizationUserDisplayName.fromString(raw.displayName),
      raw.createdAt,
      raw.updatedAt,
      raw.passwordHash || undefined,
    );
  }

  static toPersistence(organizationUser: OrganizationUser) {
    return {
      id: organizationUser.getId().value,
      email: organizationUser.getEmail().value,
      status: organizationUser.getStatus().value,
      version: organizationUser.getVersion().value,
      displayName: organizationUser.getDisplayName().value,
      passwordHash: organizationUser.getPasswordHash(),
      createdAt: organizationUser.getCreatedAt(),
      updatedAt: organizationUser.getUpdatedAt(),
    };
  }
}
