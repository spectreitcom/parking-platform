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

@Injectable()
export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(place: Place, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    await prisma.place.upsert({
      where: {
        id: place.getId().value,
      },
      create: {
        id: place.getId().value,
        name: place.getName().value,
        latitude: place.getCoords().latitude,
        longitude: place.getCoords().longitude,
        active: place.isActive(),
        address: place.getAddress().value,
        placeTypeId: place.getPlaceTypeId().value,
      },
      update: {
        name: place.getName().value,
        latitude: place.getCoords().latitude,
        longitude: place.getCoords().longitude,
        active: place.isActive(),
        address: place.getAddress().value,
        placeTypeId: place.getPlaceTypeId().value,
      },
    });
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
    );
  }
}
