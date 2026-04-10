import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/user-iam/application/ports/user.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { User } from '../../domain/user';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserMapper } from 'src/modules/user-iam/infrastructure/persistence/user.mapper';
import { ConcurrencyError } from 'src/shared/errors';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(user: User, options?: RepositorySaveOptions): Promise<void> {
    const isNew = options?.isNew ?? false;
    const _tx = options?.tx;
    const { id } = UserMapper.toPersistence(user);

    if (_tx) {
      await this.createOrUpdate(isNew, id, user, _tx);
      return;
    }

    await this.prismaService.$transaction(async (tx) => {
      await this.createOrUpdate(isNew, id, user, tx);
    });
  }

  private async createOrUpdate(
    isNew: boolean,
    userId: string,
    user: User,
    tx: PrismaTx,
  ) {
    const { updatedAt, createdAt, name, email, provider, passwordHash } =
      UserMapper.toPersistence(user);

    const record = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!record) {
      if (!isNew) throw new ConcurrencyError('User', userId);

      await tx.user.create({
        data: {
          id: userId,
          name,
          email,
          provider,
          passwordHash,
          createdAt,
          updatedAt,
        },
      });
      return;
    }

    try {
      await tx.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          provider,
          passwordHash,
          updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('User', userId);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<User | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.user.findUnique({
      where: { id },
    });

    if (!record) return null;

    return UserMapper.toDomain(record);
  }

  async findByEmail(email: string, tx?: PrismaTx): Promise<User | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.user.findUnique({
      where: { email },
    });

    if (!record) return null;

    return UserMapper.toDomain(record);
  }
}
