import { Injectable } from '@nestjs/common';
import { ParkingSpotRepository } from '../../application/ports/parking-spot.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { ParkingSpot } from '../../domain/parking-spot';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ParkingSpotId } from '../../domain/value-objects/parking-spot-id';
import { ParkingId } from '../../domain/value-objects/parking-id';
import { Money } from '../../domain/value-objects/money';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ConcurrencyError } from '../../../../shared/errors';

@Injectable()
export class PrismaParkingSpotRepository implements ParkingSpotRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(parkingSpot: ParkingSpot, tx?: PrismaTx): Promise<void> {
    const prisma = tx || this.prismaService;
    const id = parkingSpot.getId().value;
    const currentVersion = parkingSpot.getVersion().value;

    const record = await prisma.parkingSpot.findUnique({
      where: { id },
    });

    if (!record) {
      if (currentVersion > 1) {
        throw new ConcurrencyError('ParkingSpot', id);
      }

      await prisma.parkingSpot.create({
        data: {
          id,
          parkingId: parkingSpot.getParkingId().value,
          price: parkingSpot.getPrice().value,
          active: parkingSpot.isActive(),
          version: 1,
          parkingSpotFeatures: {
            connect: parkingSpot
              .getParkingSpotFeatureIds()
              .map((featureId) => ({
                id: featureId.value,
              })),
          },
        },
      });
      return;
    }

    try {
      await prisma.parkingSpot.update({
        where: {
          id,
          version: currentVersion,
        },
        data: {
          price: parkingSpot.getPrice().value,
          active: parkingSpot.isActive(),
          version: {
            increment: 1,
          },
          parkingSpotFeatures: {
            set: parkingSpot.getParkingSpotFeatureIds().map((featureId) => ({
              id: featureId.value,
            })),
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
        parkingSpotFeatures: {
          select: { id: true },
        },
      },
    });

    if (!record) {
      return null;
    }

    return new ParkingSpot(
      ParkingSpotId.fromString(record.id),
      ParkingId.fromString(record.parkingId),
      Money.fromNumber(record.price),
      record.active,
      record.parkingSpotFeatures.map((f) => ParkingFeatureId.fromString(f.id)),
      AggregateVersion.fromNumber(record.version),
    );
  }
}
