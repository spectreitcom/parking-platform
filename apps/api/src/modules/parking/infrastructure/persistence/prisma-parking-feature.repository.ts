import { Injectable } from '@nestjs/common';
import { ParkingFeatureRepository } from '../../application/ports/parking-feature.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { ParkingFeature } from '../../domain/parking-feature';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ConcurrencyError } from 'src/shared/errors';
import { RepositorySaveOptions } from 'src/shared/types';
import { ParkingFeatureMapper } from './parking-feature.mapper';

@Injectable()
export class PrismaParkingFeatureRepository implements ParkingFeatureRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    parkingFeature: ParkingFeature,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx || this.prismaService;
    const isNew = options?.isNew ?? false;
    const {
      id,
      name,
      levels,
      version: currentVersion,
    } = ParkingFeatureMapper.toPersistence(parkingFeature);

    const record = await prisma.parkingFeature.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('ParkingFeature', id);
      }

      try {
        await prisma.parkingFeature.create({
          data: {
            id,
            name,
            levels,
            version: 1,
          },
        });
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error.code === 'P2002' || error.code === 'P2025')
        ) {
          throw new ConcurrencyError('ParkingFeature', id);
        }
        throw error;
      }
      return;
    }

    if (isNew) {
      // Trying to create an entity that already exists
      throw new ConcurrencyError('ParkingFeature', id);
    }

    try {
      await prisma.parkingFeature.update({
        where: {
          id,
          version: currentVersion - 1,
        },
        data: {
          name,
          levels,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error.code === 'P2002' || error.code === 'P2025')
      ) {
        throw new ConcurrencyError('ParkingFeature', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<ParkingFeature | null> {
    const prisma = tx || this.prismaService;

    const record = await prisma.parkingFeature.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return ParkingFeatureMapper.toDomain(record);
  }

  async delete(id: string, version: number, tx?: PrismaTx): Promise<void> {
    const prisma = tx || this.prismaService;

    try {
      await prisma.parkingFeature.delete({
        where: {
          id,
          version,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('ParkingFeature', id);
      }
      throw error;
    }
  }
}
