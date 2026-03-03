import { Injectable } from '@nestjs/common';
import { ParkingFeatureRepository } from '../../application/ports/parking-feature.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { ParkingFeature } from '../../domain/parking-feature';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { ParkingFeatureName } from '../../domain/value-objects/parking-feature-name';
import { ParkingFeatureLevel } from '../../domain/value-objects/parking-feature-level';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ConcurrencyError } from '../../../../shared/errors';

@Injectable()
export class PrismaParkingFeatureRepository implements ParkingFeatureRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    parkingFeature: ParkingFeature,
    options?: { isNew?: boolean; tx?: PrismaTx },
  ): Promise<void> {
    const prisma = options?.tx || this.prismaService;
    const isNew = options?.isNew ?? false;
    const id = parkingFeature.getId().value;
    const currentVersion = parkingFeature.getVersion().value;

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
            name: parkingFeature.getName().value,
            levels: parkingFeature.getLevels().map((level) => level.value),
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
          version: currentVersion,
        },
        data: {
          name: parkingFeature.getName().value,
          levels: parkingFeature.getLevels().map((level) => level.value),
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

    return new ParkingFeature(
      ParkingFeatureId.fromString(record.id),
      ParkingFeatureName.fromString(record.name),
      ParkingFeatureLevel.fromArray(record.levels),
      AggregateVersion.fromNumber(record.version),
    );
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
