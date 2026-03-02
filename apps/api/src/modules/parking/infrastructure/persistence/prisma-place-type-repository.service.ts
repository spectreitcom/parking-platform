import { Injectable } from '@nestjs/common';
import { PlaceTypeRepository } from '../../application/ports/place-type.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PrismaTx } from 'src/shared/prisma/types';
import { PlaceType } from '../../domain/place-type';
import { PlaceTypeId } from '../../domain/value-objects/place-type-id';
import { PlaceTypeName } from '../../domain/value-objects/place-type-name';

@Injectable()
export class PrismaPlaceTypeRepository implements PlaceTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(placeType: PlaceType, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    await prisma.placeType.upsert({
      where: {
        id: placeType.getId().value,
      },
      create: {
        id: placeType.getId().value,
        name: placeType.getName().value,
      },
      update: {
        name: placeType.getName().value,
      },
    });
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

    return new PlaceType(
      PlaceTypeId.fromString(record.id),
      PlaceTypeName.fromString(record.name),
    );
  }

  async delete(id: string, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    await prisma.placeType.delete({
      where: {
        id,
      },
    });
  }
}
