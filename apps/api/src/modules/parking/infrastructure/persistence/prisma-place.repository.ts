import { Injectable } from '@nestjs/common';
import { PlaceRepository } from '../../application/ports/place.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { Place } from '../../domain/place';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PlaceId } from '../../domain/value-objects/place-id';
import { PlaceName } from '../../domain/value-objects/place-name';
import { Coords } from '../../domain/value-objects/coords';
import { Address } from '../../domain/value-objects/address';
import { PlaceTypeId } from '../../domain/value-objects/place-type-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ConcurrencyError } from '../../../../shared/errors';
import { RepositorySaveOptions } from '../../../../shared/types';

@Injectable()
export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(place: Place, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const id = place.getId().value;
    const currentVersion = place.getVersion().value;
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
          id: place.getId().value,
          name: place.getName().value,
          latitude: place.getCoords().latitude,
          longitude: place.getCoords().longitude,
          active: place.isActive(),
          address: place.getAddress().value,
          placeTypeId: place.getPlaceTypeId().value,
          version: 1,
        },
      });
      return;
    }

    try {
      await prisma.place.update({
        where: {
          id,
          version: currentVersion,
        },
        data: {
          name: place.getName().value,
          latitude: place.getCoords().latitude,
          longitude: place.getCoords().longitude,
          active: place.isActive(),
          address: place.getAddress().value,
          placeTypeId: place.getPlaceTypeId().value,
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

    return new Place(
      PlaceId.fromString(record.id),
      PlaceName.fromString(record.name),
      Coords.fromNumbers(Number(record.latitude), Number(record.longitude)),
      Address.fromString(record.address),
      record.active,
      PlaceTypeId.fromString(record.placeTypeId),
      AggregateVersion.fromNumber(record.version),
    );
  }
}
