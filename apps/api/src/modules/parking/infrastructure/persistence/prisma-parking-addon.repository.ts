import { Injectable } from '@nestjs/common';
import { ParkingAddonRepository } from '../../application/ports/parking-addon.repository';
import { ParkingAddon } from '../../domain/parking-addon';
import { PrismaTx } from 'src/shared/prisma/types';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConcurrencyError } from '../../../../shared/errors';
import { RepositorySaveOptions } from '../../../../shared/types';
import { ParkingAddonMapper } from './parking-addon.mapper';

@Injectable()
export class PrismaParkingAddonRepository implements ParkingAddonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    parkingAddon: ParkingAddon,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx || this.prismaService;
    const {
      id,
      code,
      name,
      price,
      version: currentVersion,
    } = ParkingAddonMapper.toPersistence(parkingAddon);
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
          id,
          code,
          name,
          price,
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
          code,
          name,
          price,
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

    return ParkingAddonMapper.toDomain(record);
  }

  async findByCode(code: string, tx?: PrismaTx): Promise<ParkingAddon | null> {
    const prisma = tx || this.prismaService;

    const record = await prisma.parkingAddon.findUnique({
      where: { code },
    });

    if (!record) {
      return null;
    }

    return ParkingAddonMapper.toDomain(record);
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
