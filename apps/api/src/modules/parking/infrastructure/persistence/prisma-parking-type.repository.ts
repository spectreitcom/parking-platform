import { Injectable } from '@nestjs/common';
import { ParkingTypeRepository } from '../../application/ports/parking-type.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PrismaTx } from 'src/shared/prisma/types';
import { ParkingType } from '../../domain/parking-type';
import { ParkingTypeId } from '../../domain/value-objects/parking-type-id';
import { ParkingTypeName } from '../../domain/value-objects/parking-type-name';

@Injectable()
export class PrismaParkingTypeRepository implements ParkingTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(parkingType: ParkingType, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    await prisma.parkingType.upsert({
      where: {
        id: parkingType.getId().value,
      },
      create: {
        id: parkingType.getId().value,
        name: parkingType.getName().value,
      },
      update: {
        name: parkingType.getName().value,
      },
    });
  }

  async findById(id: string, tx?: PrismaTx): Promise<ParkingType | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.parkingType.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return new ParkingType(
      ParkingTypeId.fromString(record.id),
      ParkingTypeName.fromString(record.name),
    );
  }

  async delete(id: string, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prismaService;

    await prisma.parkingType.delete({
      where: {
        id,
      },
    });
  }
}
