import { Injectable } from '@nestjs/common';
import { AdminUserRepository } from '../../application/ports/admin-user.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { AdminUser } from '../../domain/admin-user';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConcurrencyError } from '../../../../shared/errors';
import { AdminUserMapper } from './admin-user.mapper';

@Injectable()
export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    adminUser: AdminUser,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;

    const {
      id,
      version: currentVersion,
      isSuperAdmin,
      email,
      displayName,
      status,
      passwordHash,
      createdAt,
      updatedAt,
    } = AdminUserMapper.toPersistence(adminUser);
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
          isSuperAdmin,
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
      throw new ConcurrencyError('AdminUser', id);
    }

    try {
      await prisma.adminUser.update({
        where: { id, version: currentVersion },
        data: {
          version: {
            increment: 1,
          },
          isSuperAdmin,
          email,
          displayName,
          status,
          passwordHash,
          updatedAt,
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

    return AdminUserMapper.toDomain(record);
  }

  async findById(id: string, tx?: PrismaTx): Promise<AdminUser | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return AdminUserMapper.toDomain(record);
  }
}
