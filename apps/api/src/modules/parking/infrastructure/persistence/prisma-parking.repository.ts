import { Injectable } from '@nestjs/common';
import { ParkingRepository } from '../../application/ports/parking.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { Parking } from '../../domain/parking';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ConcurrencyError } from 'src/shared/errors';
import { RepositorySaveOptions } from 'src/shared/types';

import { ParkingMapper } from './parking.mapper';

@Injectable()
export class PrismaParkingRepository implements ParkingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(parking: Parking, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const {
      id,
      name,
      description,
      active,
      address,
      latitude,
      longitude,
      organizationId,
      placeId,
      statute,
      assetIds,
      version: currentVersion,
      parkingFeatures,
      parkingAddons,
      createdAt,
      updatedAt,
    } = ParkingMapper.toPersistence(parking);

    const isNew = options?.isNew ?? false;

    const record = await prisma.parking.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Parking', id);
      }

      await prisma.parking.create({
        data: {
          id,
          name,
          description,
          active,
          address,
          latitude,
          longitude,
          organizationId,
          placeId,
          statute,
          assetIds,
          createdAt,
          updatedAt,
          version: 1,
          parkingFeatures: {
            connect: parkingFeatures,
          },
          parkingAddons: {
            connect: parkingAddons,
          },
        },
      });
      return;
    }

    try {
      await prisma.parking.update({
        where: {
          id,
          version: currentVersion - 1,
        },
        data: {
          name,
          description,
          active,
          address,
          latitude,
          longitude,
          organizationId,
          placeId,
          statute,
          assetIds,
          updatedAt,
          version: {
            increment: 1,
          },
          parkingFeatures: {
            set: parkingFeatures,
          },
          parkingAddons: {
            set: parkingAddons,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Parking', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<Parking | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.parking.findUnique({
      where: { id },
      include: {
        parkingFeatures: true,
        parkingAddons: true,
      },
    });

    if (!record) {
      return null;
    }

    return ParkingMapper.toDomain(record);
  }
}
