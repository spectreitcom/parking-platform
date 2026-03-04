import { Injectable } from '@nestjs/common';
import { ParkingRepository } from '../../application/ports/parking.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { Parking } from '../../domain/parking';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ParkingId } from '../../domain/value-objects/parking-id';
import { OwnerId } from '../../domain/value-objects/owner-id';
import { ParkingName } from '../../domain/value-objects/parking-name';
import { Address } from '../../domain/value-objects/address';
import { Coords } from '../../domain/value-objects/coords';
import { AssetId } from '../../domain/value-objects/asset-id';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { ParkingAddonId } from '../../domain/value-objects/parking-addon-id';
import { PlaceId } from '../../domain/value-objects/place-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ConcurrencyError } from '../../../../shared/errors';
import { RepositorySaveOptions } from '../../../../shared/types';

@Injectable()
export class PrismaParkingRepository implements ParkingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(parking: Parking, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const id = parking.getId().value;
    const currentVersion = parking.getVersion().value;
    const isNew = options?.isNew ?? false;

    const record = await prisma.parking.findUnique({
      where: { id },
    });

    const parkingFeatures = parking
      .getParkingFeatureIds()
      .map((id) => ({ id: id.value }));
    const parkingAddons = parking
      .getParkingAddonIds()
      .map((id) => ({ id: id.value }));

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Parking', id);
      }

      await prisma.parking.create({
        data: {
          id,
          name: parking.getName().value,
          description: parking.getDescription(),
          active: parking.isActive(),
          address: parking.getAddress().value,
          latitude: parking.getCoords().latitude,
          longitude: parking.getCoords().longitude,
          ownerId: parking.getOwnerId().value,
          placeId: parking.getPlaceId().value,
          statute: parking.getStatute(),
          assetIds: parking.getAssetIds().map((id) => id.value),
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
          version: currentVersion,
        },
        data: {
          name: parking.getName().value,
          description: parking.getDescription(),
          active: parking.isActive(),
          address: parking.getAddress().value,
          latitude: parking.getCoords().latitude,
          longitude: parking.getCoords().longitude,
          ownerId: parking.getOwnerId().value,
          placeId: parking.getPlaceId().value,
          statute: parking.getStatute(),
          assetIds: parking.getAssetIds().map((id) => id.value),
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
        parkingFeatures: { select: { id: true } },
        parkingAddons: { select: { id: true } },
      },
    });

    if (!record) {
      return null;
    }

    return new Parking(
      ParkingId.fromString(record.id),
      OwnerId.fromString(record.ownerId),
      ParkingName.fromString(record.name),
      record.active,
      Address.fromString(record.address),
      Coords.fromNumbers(Number(record.latitude), Number(record.longitude)),
      record.assetIds.map((assetId) => AssetId.fromString(assetId)),
      record.parkingFeatures.map((f) => ParkingFeatureId.fromString(f.id)),
      record.parkingAddons.map((a) => ParkingAddonId.fromString(a.id)),
      PlaceId.fromString(record.placeId),
      AggregateVersion.fromNumber(record.version),
      record.description ?? undefined,
      record.statute ?? undefined,
    );
  }
}
