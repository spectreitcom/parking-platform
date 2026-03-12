import { Injectable } from '@nestjs/common';
import { OrganizationUserRepository } from '../../application/ports/organization-user.repository';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';
import { OrganizationUser } from '../../domain/organization-user';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConcurrencyError } from '../../../../shared/errors';
import { OrganizationUserId } from '../../domain/value-objects/organization-user-id';
import { Email } from '../../../../shared/value-objects/email';
import { OrganizationUserDisplayName } from '../../domain/value-objects/organization-user-display-name';
import { OrganizationUserStatus } from '../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@Injectable()
export class PrismaOrganizationUserRepository implements OrganizationUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    organizationUser: OrganizationUser,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;

    const id = organizationUser.getId().value;
    const isNew = options?.isNew ?? false;

    const record = await prisma.organizationUser.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('OrganizationUser', id);
      }

      await prisma.organizationUser.create({
        data: {
          id,
          version: organizationUser.getVersion().value,
          email: organizationUser.getEmail().value,
          displayName: organizationUser.getDisplayName().value,
          status: organizationUser.getStatus().value,
          passwordHash: organizationUser.getPasswordHash(),
          createdAt: organizationUser.getCreatedAt(),
          updatedAt: organizationUser.getUpdatedAt(),
        },
      });

      return;
    }

    if (isNew) {
      throw new ConcurrencyError('OrganizationUser', id);
    }

    try {
      await prisma.organizationUser.update({
        where: { id, version: organizationUser.getVersion().value },
        data: {
          version: {
            increment: 1,
          },
          email: organizationUser.getEmail().value,
          displayName: organizationUser.getDisplayName().value,
          status: organizationUser.getStatus().value,
          passwordHash: organizationUser.getPasswordHash(),
          updatedAt: organizationUser.getUpdatedAt(),
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('OrganizationUser', id);
      }
      throw error;
    }
  }

  async findByEmail(
    email: string,
    tx?: PrismaTx,
  ): Promise<OrganizationUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.organizationUser.findUnique({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return new OrganizationUser(
      OrganizationUserId.fromString(record.id),
      Email.fromString(record.email),
      OrganizationUserStatus.fromString(record.status),
      AggregateVersion.fromNumber(record.version),
      OrganizationUserDisplayName.fromString(record.displayName),
      record.createdAt,
      record.updatedAt,
      record.passwordHash ?? undefined,
    );
  }

  async findById(id: string, tx?: PrismaTx): Promise<OrganizationUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.organizationUser.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return new OrganizationUser(
      OrganizationUserId.fromString(record.id),
      Email.fromString(record.email),
      OrganizationUserStatus.fromString(record.status),
      AggregateVersion.fromNumber(record.version),
      OrganizationUserDisplayName.fromString(record.displayName),
      record.createdAt,
      record.updatedAt,
      record.passwordHash ?? undefined,
    );
  }
}
