import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../application/ports/cart.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { Cart } from '../../domain/cart';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CartMapper } from './cart.mapper';
import { ConcurrencyError } from '../../../../shared/errors';
import { CartAddonRaw } from '../../application/types';

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(cart: Cart, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const isNew = options?.isNew ?? false;

    const {
      id,
      userId,
      addons,
      arrival,
      departure,
      days,
      createdAt,
      parkingSpotId,
      priceByDay,
      total,
    } = CartMapper.toPersistence(cart);

    const record = await prisma.cart.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Cart', id);
      }

      await prisma.cart.create({
        data: {
          id,
          userId,
          addons: addons as CartAddonRaw[],
          arrival,
          departure,
          days,
          createdAt,
          parkingSpotId,
          priceByDay,
          total,
        },
      });
      return;
    }

    try {
      await prisma.cart.update({
        where: {
          id,
          userId,
        },
        data: {
          userId,
          addons: addons as CartAddonRaw[],
          arrival,
          departure,
          days,
          createdAt,
          parkingSpotId,
          priceByDay,
          total,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Cart', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<Cart | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.cart.findUnique({
      where: {
        id,
      },
    });

    if (!record) return null;
    return CartMapper.toDomain(record);
  }
}
