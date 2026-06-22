import { Injectable } from '@nestjs/common';
import { ParkingSpotRepository } from '../../application/ports/parking-spot.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { ParkingSpot } from '../../domain/parking-spot';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ConcurrencyError } from 'src/shared/errors';
import { RepositorySaveOptions } from 'src/shared/types';
import { ParkingSpotMapper } from './parking-spot.mapper';

@Injectable()
export class PrismaParkingSpotRepository implements ParkingSpotRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    parkingSpot: ParkingSpot,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx || this.prismaService;
    const {
      id,
      parkingId,
      price,
      active,
      parkingSpotFeatures,
      version: currentVersion,
    } = ParkingSpotMapper.toPersistence(parkingSpot);
    const isNew = options?.isNew ?? false;

    const record = await prisma.parkingSpot.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('ParkingSpot', id);
      }

      await prisma.parkingSpot.create({
        data: {
          id,
          parkingId,
          price,
          active,
          version: 1,
          parkingSpotFeatures: {
            connect: parkingSpotFeatures,
          },
        },
      });
      return;
    }

    try {
      await prisma.parkingSpot.update({
        where: {
          id,
          version: currentVersion - 1,
        },
        data: {
          price,
          active,
          version: {
            increment: 1,
          },
          parkingSpotFeatures: {
            set: parkingSpotFeatures,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('ParkingSpot', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<ParkingSpot | null> {
    const prisma = tx || this.prismaService;

    const record = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        parkingSpotFeatures: true,
      },
    });

    if (!record) {
      return null;
    }

    return ParkingSpotMapper.toDomain(record);
  }
}
