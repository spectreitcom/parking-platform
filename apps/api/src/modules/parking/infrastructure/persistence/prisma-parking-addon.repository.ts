import { Injectable } from '@nestjs/common';
import { ParkingAddonRepository } from '../../application/ports/parking-addon.repository';
import { ParkingAddon } from '../../domain/parking-addon';
import { PrismaTx } from 'src/shared/prisma/types';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ParkingAddonId } from '../../domain/value-objects/parking-addon-id';
import { ParkingAddonCode } from '../../domain/value-objects/parking-addon-code';
import { ParkingAddonName } from '../../domain/value-objects/parking-addon-name';
import { Money } from '../../domain/value-objects/money';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ConcurrencyError } from '../../../../shared/errors';
import { RepositorySaveOptions } from '../../../../shared/types';

@Injectable()
export class PrismaParkingAddonRepository implements ParkingAddonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    parkingAddon: ParkingAddon,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx || this.prismaService;
    const id = parkingAddon.getId().value;
    const currentVersion = parkingAddon.getVersion().value;
    const isNew = options?.isNew ?? false;

    const record = await prisma.parkingAddon.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('ParkingAddon', id);
      }

      await prisma.parkingAddon.create({
        data: {
          id: parkingAddon.getId().value,
          code: parkingAddon.getCode().value,
          name: parkingAddon.getName().value,
          price: parkingAddon.getPrice().value,
          version: 1,
        },
      });
      return;
    }

    if (isNew) {
      throw new ConcurrencyError('ParkingAddon', id);
    }

    try {
      await prisma.parkingAddon.update({
        where: {
          id,
          version: currentVersion,
        },
        data: {
          code: parkingAddon.getCode().value,
          name: parkingAddon.getName().value,
          price: parkingAddon.getPrice().value,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('ParkingAddon', id);
      }
      throw error;
    }
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
      AggregateVersion.fromNumber(record.version),
    );
  }

  async findByCode(code: string, tx?: PrismaTx): Promise<ParkingAddon | null> {
    const prisma = tx || this.prismaService;

    const record = await prisma.parkingAddon.findUnique({
      where: { code },
    });

    if (!record) {
      return null;
    }

    return new ParkingAddon(
      ParkingAddonId.fromString(record.id),
      ParkingAddonCode.fromString(record.code),
      ParkingAddonName.fromString(record.name),
      Money.fromNumber(record.price),
      AggregateVersion.fromNumber(record.version),
    );
  }

  async delete(id: string, version: number, tx?: PrismaTx): Promise<void> {
    const prisma = tx || this.prismaService;

    try {
      await prisma.parkingAddon.delete({
        where: {
          id,
          version,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('ParkingAddon', id);
      }
      throw error;
    }
  }
}
