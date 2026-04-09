import { Injectable } from '@nestjs/common';
import { PlaceTypeRepository } from '../../application/ports/place-type.repository';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PrismaTx } from 'src/shared/prisma/types';
import { PlaceType } from '../../domain/place-type';
import { ConcurrencyError, UniqueConstraintError } from 'src/shared/errors';
import { RepositorySaveOptions } from 'src/shared/types';
import { PlaceTypeMapper } from './place-type.mapper';

@Injectable()
export class PrismaPlaceTypeRepository implements PlaceTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    placeType: PlaceType,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const {
      id,
      name,
      version: currentVersion,
    } = PlaceTypeMapper.toPersistence(placeType);
    const isNew = options?.isNew ?? false;

    const record = await prisma.placeType.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('PlaceType', id);
      }

      try {
        await prisma.placeType.create({
          data: {
            id,
            name,
            version: 1,
          },
        });
        return;
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          throw new UniqueConstraintError('PlaceType');
        }
        throw error;
      }
    }

    try {
      await prisma.placeType.update({
        where: {
          id,
          version: currentVersion,
        },
        data: {
          name,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('PlaceType', id);
      }
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new UniqueConstraintError('PlaceType');
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<PlaceType | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.placeType.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return PlaceTypeMapper.toDomain(record);
  }

  async delete(id: string, version: number, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    try {
      await prisma.placeType.delete({
        where: {
          id,
          version,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('PlaceType', id);
      }
      throw error;
    }
  }
}
