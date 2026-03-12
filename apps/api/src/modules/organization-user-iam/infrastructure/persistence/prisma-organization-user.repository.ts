import { Injectable } from '@nestjs/common';
import { OrganizationUserRepository } from '../../application/ports/organization-user.repository';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';
import { OrganizationUser } from '../../domain/organization-user';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConcurrencyError } from '../../../../shared/errors';
import { OrganizationUserMapper } from './organization-user.mapper';

@Injectable()
export class PrismaOrganizationUserRepository implements OrganizationUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    organizationUser: OrganizationUser,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;

    const {
      id,
      version: currentVersion,
      email,
      displayName,
      status,
      passwordHash,
      createdAt,
      updatedAt,
    } = OrganizationUserMapper.toPersistence(organizationUser);
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
          version: currentVersion,
          email,
          displayName,
          status,
          passwordHash,
          createdAt,
          updatedAt,
        },
      });

      return;
    }

    if (isNew) {
      throw new ConcurrencyError('OrganizationUser', id);
    }

    try {
      await prisma.organizationUser.update({
        where: { id, version: currentVersion },
        data: {
          version: {
            increment: 1,
          },
          email,
          displayName,
          status,
          passwordHash,
          updatedAt,
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

    return OrganizationUserMapper.toDomain(record);
  }

  async findById(id: string, tx?: PrismaTx): Promise<OrganizationUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.organizationUser.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return OrganizationUserMapper.toDomain(record);
  }
}
