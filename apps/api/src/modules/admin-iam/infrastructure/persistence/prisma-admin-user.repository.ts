import { Injectable } from '@nestjs/common';
import { AdminUserRepository } from '../../application/ports/admin-user.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { AdminUser } from '../../domain/admin-user';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConcurrencyError } from '../../../../shared/errors';
import { AdminId } from '../../domain/value-objects/admin-id';
import { Email } from '../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@Injectable()
export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    adminUser: AdminUser,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;

    const id = adminUser.getId().value;
    const isNew = options?.isNew ?? false;

    const record = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('AdminUser', id);
      }

      await prisma.adminUser.create({
        data: {
          id,
          version: 1,
          isSuperAdmin: adminUser.getIsSuperAdmin(),
          email: adminUser.getEmail().value,
          displayName: adminUser.getDisplayName().value,
          status: adminUser.getStatus().value,
          passwordHash: adminUser.getPasswordHash(),
          createdAt: adminUser.getCreatedAt(),
          updatedAt: adminUser.getUpdatedAt(),
        },
      });

      return;
    }

    if (isNew) {
      throw new ConcurrencyError('AdminUser', id);
    }

    try {
      await prisma.adminUser.update({
        where: { id, version: adminUser.getVersion().value },
        data: {
          version: {
            increment: 1,
          },
          isSuperAdmin: adminUser.getIsSuperAdmin(),
          email: adminUser.getEmail().value,
          displayName: adminUser.getDisplayName().value,
          status: adminUser.getStatus().value,
          passwordHash: adminUser.getPasswordHash(),
          updatedAt: adminUser.getUpdatedAt(),
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('AdminUser', id);
      }
      throw error;
    }
  }

  async findByEmail(email: string, tx?: PrismaTx): Promise<AdminUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return new AdminUser(
      AdminId.fromString(record.id),
      Email.fromString(record.email),
      record.isSuperAdmin,
      AdminDisplayName.fromString(record.displayName),
      AdminStatus.fromString(record.status),
      AggregateVersion.fromNumber(record.version),
      record.createdAt,
      record.updatedAt,
      record.passwordHash ?? undefined,
    );
  }

  async findById(id: string, tx?: PrismaTx): Promise<AdminUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return new AdminUser(
      AdminId.fromString(record.id),
      Email.fromString(record.email),
      record.isSuperAdmin,
      AdminDisplayName.fromString(record.displayName),
      AdminStatus.fromString(record.status),
      AggregateVersion.fromNumber(record.version),
      record.createdAt,
      record.updatedAt,
      record.passwordHash ?? undefined,
    );
  }
}
