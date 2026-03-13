import { AdminUser } from '../../domain/admin-user';
import { AdminId } from '../../domain/value-objects/admin-id';
import { Email } from '../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { AdminUser as AdminUserModel } from '@prisma/client';

export class AdminUserMapper {
  static toDomain(raw: AdminUserModel): AdminUser {
    return AdminUser.reconstruct(
      AdminId.fromString(raw.id),
      Email.fromString(raw.email),
      raw.isSuperAdmin,
      AdminDisplayName.fromString(raw.displayName),
      AdminStatus.fromString(raw.status),
      AggregateVersion.fromNumber(raw.version),
      raw.createdAt,
      raw.updatedAt,
      raw.passwordHash || undefined,
    );
  }

  static toPersistence(adminUser: AdminUser) {
    return {
      id: adminUser.getId().value,
      email: adminUser.getEmail().value,
      isSuperAdmin: adminUser.getIsSuperAdmin(),
      displayName: adminUser.getDisplayName().value,
      status: adminUser.getStatus().value,
      version: adminUser.getVersion().value,
      passwordHash: adminUser.getPasswordHash(),
      createdAt: adminUser.getCreatedAt(),
      updatedAt: adminUser.getUpdatedAt(),
    };
  }
}
