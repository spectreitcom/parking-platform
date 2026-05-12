import { Injectable } from '@nestjs/common';
import { PlaceRepository } from '../../application/ports/place.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { Place } from '../../domain/place';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ConcurrencyError } from 'src/shared/errors';
import { RepositorySaveOptions } from 'src/shared/types';
import { PlaceMapper } from './place.mapper';

@Injectable()
export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(place: Place, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const {
      id,
      name,
      latitude,
      longitude,
      active,
      address,
      placeTypeId,
      version: currentVersion,
    } = PlaceMapper.toPersistence(place);
    const isNew = options?.isNew ?? false;

    const record = await prisma.place.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Place', id);
      }

      await prisma.place.create({
        data: {
          id,
          name,
          latitude,
          longitude,
          active,
          address,
          placeTypeId,
          version: 1,
        },
      });
      return;
    }

    if (isNew) {
      throw new ConcurrencyError('Place', id);
    }

    try {
      await prisma.place.update({
        where: {
          id,
          version: currentVersion - 1,
        },
        data: {
          name,
          latitude,
          longitude,
          active,
          address,
          placeTypeId,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Place', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<Place | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.place.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return PlaceMapper.toDomain(record);
  }
}
