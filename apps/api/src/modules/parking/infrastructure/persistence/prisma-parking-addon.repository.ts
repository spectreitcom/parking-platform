import { Injectable } from '@nestjs/common';
import { ParkingAddonRepository } from '../../application/ports/parking-addon.repository';
import { ParkingAddon } from '../../domain/parking-addon';
import { PrismaTx } from 'src/shared/prisma/types';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ParkingAddonId } from '../../domain/value-objects/parking-addon-id';
import { ParkingAddonCode } from '../../domain/value-objects/parking-addon-code';
import { ParkingAddonName } from '../../domain/value-objects/parking-addon-name';
import { Money } from '../../domain/value-objects/money';

@Injectable()
export class PrismaParkingAddonRepository implements ParkingAddonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(parkingAddon: ParkingAddon, tx?: PrismaTx): Promise<void> {
    const prisma = tx || this.prismaService;

    await prisma.parkingAddon.upsert({
      where: { id: parkingAddon.getId().value },
      update: {
        code: parkingAddon.getCode().value,
        name: parkingAddon.getName().value,
        price: parkingAddon.getPrice().value,
      },
      create: {
        id: parkingAddon.getId().value,
        code: parkingAddon.getCode().value,
        name: parkingAddon.getName().value,
        price: parkingAddon.getPrice().value,
      },
    });
  }

  async findById(id: string, tx?: PrismaTx): Promise<ParkingAddon | null> {
    const prisma = tx || this.prismaService;

    const record = await prisma.parkingAddon.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return new ParkingAddon(
      ParkingAddonId.fromString(record.id),
      ParkingAddonCode.fromString(record.code),
      ParkingAddonName.fromString(record.name),
      Money.fromNumber(record.price),
    );
  }

  async delete(id: string, tx?: PrismaTx): Promise<void> {
    const prisma = tx || this.prismaService;

    await prisma.parkingAddon.delete({
      where: { id },
    });
  }
}
